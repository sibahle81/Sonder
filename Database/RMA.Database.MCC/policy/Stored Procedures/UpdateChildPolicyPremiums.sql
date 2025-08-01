CREATE PROCEDURE [policy].[UpdateChildPolicyPremiums]
	@policyId int, 
	@userId varchar(128)
AS BEGIN

    set nocount on
    set xact_abort on
    set arithabort on

	declare @date datetime = getdate()
	set @date = dateadd(millisecond, -datepart(millisecond, @date), @date)

	declare @cutoffDate date
	select @cutoffDate =[Value] from [common].[Settings] (nolock) where [Key] = 'GroupRoundingCutoffDate'
	set @cutoffDate = isnull(@cutoffDate, dateadd(year, 100, getdate()))

	begin try
		
		begin tran

		set transaction isolation level read committed

		-- Update the child policies' admin, binder fee, commission percentages
		update c with (updlock, rowlock) set
			c.[AdminPercentage] = p.[AdminPercentage],
			c.[CommissionPercentage] = p.[CommissionPercentage],
			c.[BinderFeePercentage] = p.[BinderFeePercentage],
			c.[PremiumAdjustmentPercentage] = p.[PremiumAdjustmentPercentage],
			c.[PaymentFrequencyId] = p.[PaymentFrequencyId],
			c.[IsEuropAssist] = p.[IsEuropAssist],
			c.[EuropAssistEffectiveDate] = p.[EuropAssistEffectiveDate],
			c.[EuropAssistEndDate] = p.[EuropAssistEndDate],
			c.[PolicyPayeeId] = p.[PolicyOwnerId]
		from [policy].[Policy] p
			inner join [policy].[Policy] c on c.[ParentPolicyId] = p.[PolicyId]
		where p.[PolicyId] = @policyId
		option (optimize for unknown)

		declare @policy table (
			PolicyId int primary key,
			Rounding int,
			Premium money,
			Multiplier int,
			InstallmentPremium money,
			AnnualPremium money,
			PayPremium bit index tidx_001 nonclustered
		)

		-- Get the vaps premium, if any
		declare @vaps money
		select @vaps = sum(br.BaseRate)
		from policy.Policy p (nolock)
			inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId
		where p.PolicyId = @policyId
		  and br.BenefitTypeId = 2

		insert @policy
			select child.PolicyId,
				iif(parent.PolicyInceptionDate > @cutoffDate or isnull(re.PolicyId, 0) > 0, 2, 0) [Rounding],
					-- Base rate, including vaps
					policy.CalculateGroupSchemePolicyPremium(sum(br.BaseRate) + isnull(@vaps, 0.00), child.AdminPercentage, child.CommissionPercentage, child.BinderFeePercentage, child.PremiumAdjustmentPercentage) 
					-- EuropAssist fee
					+ (isnull(ea.BasePremium + ea.ProfitExpenseLoadingPremium, 0.00) / (1 - child.CommissionPercentage)) [Premium],
				case child.PaymentFrequencyId 
					when 1 then 12
					when 2 then 1
					when 3 then 3
					when 4 then 6
				end [Multiplier],
				0 [InstallmentPremium],
				0 [AnnualPremium],
				isnull(pam.DoRaiseInstallementPremiums, 0) [PayPremium]
			from policy.Policy parent (nolock)
				inner join policy.Policy child (nolock) on child.ParentPolicyId = parent.PolicyId
				inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = child.PolicyId
				inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = child.ProductOptionId and br.BenefitId = pil.StatedBenefitId
				left join policy.GroupSchemePremiumRoundingExclusion re (nolock) on re.PolicyId = parent.PolicyId
				left join common.EuropAssistPremiumMatrix ea (nolock) on child.IsEuropAssist = 1 and child.EuropAssistEffectiveDate >= ea.StartDate and isnull(child.EuropAssistEndDate, '3000-01-01') <= isnull(ea.EndDate, '3000-01-01')
				left join policy.PolicyStatusActionsMatrix pam (nolock) on pam.PolicyStatus = child.PolicyStatusId
			where parent.PolicyId = @policyId
			  and child.IsDeleted = 0
			  and pil.IsDeleted = 0
			  and pil.InsuredLifeStatusId = 1
			group by child.PolicyId,
				parent.PolicyInceptionDate,
				child.AdminPercentage, 
				child.CommissionPercentage, 
				child.BinderFeePercentage, 
				child.PremiumAdjustmentPercentage,
				child.PaymentFrequencyId,
				re.PolicyId,
				ea.BasePremium,
				ea.ProfitExpenseLoadingPremium,
				pam.DoRaiseInstallementPremiums

		update @policy set 
			InstallmentPremium = round(Premium, Rounding) * Multiplier,
			AnnualPremium = round(Premium, Rounding) * 12.0

		update child with (updlock, rowlock) set
			child.AnnualPremium = isnull(x.AnnualPremium, 0.00),
			child.InstallmentPremium = isnull(x.InstallmentPremium, 0.00),
			child.ModifiedBy = @userId,
			child.ModifiedDate = @date
		from @policy x
			inner join policy.Policy child on child.PolicyId = x.PolicyId
		option (optimize for unknown)

		update parent with (updlock, rowlock) set
			parent.AnnualPremium = x.AnnualPremium,
			parent.InstallmentPremium = x.InstallmentPremium,
			parent.ModifiedBy = @userId,
			parent.ModifiedDate = @date
		from policy.Policy parent
			inner join (
				select @policyId [PolicyId],
					isnull(sum(AnnualPremium), 0.00) [AnnualPremium], 
					isnull(sum(InstallmentPremium), 0.00) [InstallmentPremium]
				from @policy
				where PayPremium = 1
			) x on x.PolicyId = parent.PolicyId
		option (optimize for unknown)

		commit tran

	end try
	begin catch
		if @@trancount > 0 begin 
			rollback tran
		end
		declare @message varchar(4000) = error_message()
		declare @severity int = error_severity()
		declare @state int = error_state()
		raiserror(@message, @severity, @state)
	end catch

END
