CREATE   PROCEDURE [policy].[UpdateChildPolicyPremiums] (@policyId int, @userId varchar(64))
as begin

	--declare @policyId int = 6011
	--declare @userId varchar(64) = 'system@randmutual.co.za'

	set nocount on

	begin tran trxUpdateChildPremiums 

	begin try
		-- Update the child policies' admin and commission percentages
		update c set
			c.[AdminPercentage] = p.[AdminPercentage],
			c.[CommissionPercentage] = p.[CommissionPercentage],
			c.[BinderFeePercentage] = p.[BinderFeePercentage],
			c.[PremiumAdjustmentPercentage] = p.[PremiumAdjustmentPercentage],
			c.[PaymentFrequencyId] = p.[PaymentFrequencyId]
		from [policy].[Policy] p 
			inner join [policy].[Policy] c on c.[ParentPolicyId] = p.[PolicyId]
		where p.[PolicyId] = @policyId

		declare @insured_life table (
			ParentPolicyId int,
			PolicyId int,
			PolicyInceptionDate date,
			IsGroupPolicy bit,
			RolePlayerId int,
			RolePlayerTypeId int,
			InsuredLifeStatusId int,
			BenefitId int,
			Rate decimal(18, 10),
			AdditionalRate decimal(18, 10)
			primary key (ParentPolicyId, PolicyId, RolePlayerId)
		)

		insert into @insured_life
			select isnull(p.ParentPolicyId, 0) [ParentPolicyId],
				p.PolicyId,
				p.PolicyInceptionDate,
				iif(isnull(c.RolePlayerId, 0) > 0, 1, 0) [IsGroupPolicy],
				pil.RolePlayerId,
				pil.RolePlayerTypeId,
				pil.InsuredLifeStatusId,
				isnull(br.BenefitId, 0) [BenefitId],
				isnull(case pil.InsuredLifeStatusId when 1 then br.BaseRate else 0.00 end, 0.00) [BaseRate],
				isnull(t.[Rate], 0.00) [Rate]
			from [policy].[Policy] p with (nolock)
				inner join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = p.PolicyId
				inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = pil.RolePlayerId
				inner join product.CurrentBenefitRate br with (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId
				left join client.Person per with (nolock) on per.RolePlayerId = pil.RolePlayerId
				left join client.Company c with (nolock) on c.RolePlayerId = p.PolicyPayeeId
				left join (
					select 10 [RolePlayerTypeId],
						sum(br.[BaseRate]) [Rate]
					from policy.Policy p
						inner join product.CurrentBenefitRate br on br.ProductOptionId = p.ProductOptionId and br.BenefitTypeId = 2
					where p.PolicyId = @policyId
					group by p.PolicyId
				) t on t.RolePlayerTypeId = pil.RolePlayerTypeId
			where p.ParentPolicyId = @policyId

		declare @policy table (
			PolicyId int primary key not null,
			PolicyNumber varchar(32),
			ParentPolicyId int,
			IsGroupPolicy bit,
			PaymentFrequencyId int,
			Multiplier decimal(6,1),
			AdminFeePercentage decimal(6, 4),
			CommissionPercentage decimal(6, 4),
			BinderFeePercentage decimal(6, 4),
			PremiumAdjustmentPercentage decimal(6,4),
			BaseRate decimal(18, 10),
			AdditionalRate decimal(18, 10),
			MonthlyPremium money
		)

		insert into @policy
			select p.PolicyId,
				p.PolicyNumber,
				i.ParentPolicyId,
				i.IsGroupPolicy,
				p.PaymentFrequencyId,
				case p.PaymentFrequencyId 
					when 1 then 12
					when 2 then 1
					when 3 then 3
					when 4 then 6
				end,
				p.AdminPercentage,
				p.CommissionPercentage,
				p.BinderFeePercentage,
				p.PremiumAdjustmentPercentage,
				sum(i.Rate),
				sum(i.AdditionalRate),
				0
			from policy.Policy p with (nolock)
				inner join @insured_life i on i.PolicyId = p.PolicyId
			where i.InsuredLifeStatusId = 1
			group by p.PolicyId,
				p.PolicyNumber,
				i.ParentPolicyId,
				i.IsGroupPolicy,
				p.PaymentFrequencyId,
				p.AdminPercentage,
				p.CommissionPercentage,
				p.BinderFeePercentage,
				p.PremiumAdjustmentPercentage

		-- Get the policy inception date and the cutoff date for group scheme premium rounding
		declare @policyInceptionDate date
		select top 1 @policyInceptionDate = [PolicyInceptionDate] from @insured_life
	
		declare @cutoffDate date
		select @cutoffDate = isnull([Value], dateadd(year, 100, getdate())) from [common].[Settings] where [Key] = 'GroupRoundingCutoffDate'

		-- Update the policy premiums
		if (@policyInceptionDate > @cutoffDate) begin
			update @policy set 
				MonthlyPremium = policy.CalculateGroupSchemePolicyPremium(BaseRate, AdminFeePercentage, CommissionPercentage, BinderFeePercentage, PremiumAdjustmentPercentage) + AdditionalRate
				where IsGroupPolicy = 1
		end else begin
			update @policy set 
				MonthlyPremium = round(policy.CalculateGroupPolicyPremium(BaseRate, AdminFeePercentage, CommissionPercentage, BinderFeePercentage, PremiumAdjustmentPercentage), 0)  + AdditionalRate
				where IsGroupPolicy = 1
		end

		update @policy set 
			MonthlyPremium = round(policy.CalculateIndividualPolicyPremium(BaseRate, AdminFeePercentage, CommissionPercentage, BinderFeePercentage), 2) + AdditionalRate
			where IsGroupPolicy = 0

		-- Update individual and child policy premiums
		update p set
			p.InstallmentPremium = t.InstallmentPremium,
			p.AnnualPremium = t.AnnualPremium,
			p.ModifiedBy = @userId,
			p.ModifiedDate = getdate()
		from policy.Policy p
			inner join (
				select PolicyId,
				cast(MonthlyPremium * 12.0 as money) [AnnualPremium],
				cast(MonthlyPremium * Multiplier as money) [InstallmentPremium]
				from @policy
			) t on t.PolicyId = p.PolicyId

		-- Update the parent policy premium
		update p set
			p.[AnnualPremium] = t.[AnnualPremium],
			p.[InstallmentPremium] = t.[InstallmentPremium],
			p.ModifiedBy = @userId,
			p.ModifiedDate = getdate()
		from [policy].[Policy] p
			inner join (
				select p.[ParentPolicyId] [PolicyId],
					sum(p.[AnnualPremium]) [AnnualPremium],
					sum(p.[InstallmentPremium]) [InstallmentPremium]
				from [policy].[Policy] p with (nolock)
					inner join [policy].[PolicyStatusActionsMatrix] am with (nolock) on am.PolicyStatus = p.PolicyStatusId
				where p.[ParentPolicyId] = @policyId
				  and p.[IsDeleted] = 0
				  and am.[DoRaiseInstallementPremiums] = 1
				group by p.[ParentPolicyId]
			) t on t.[PolicyId] = p.[PolicyId]

		commit tran trxUpdateChildPremiums

	end try
	begin catch
		rollback tran trxUpdateChildPremiums
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

	set nocount off
end