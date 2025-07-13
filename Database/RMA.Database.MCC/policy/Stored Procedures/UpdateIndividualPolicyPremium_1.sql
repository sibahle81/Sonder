
CREATE   PROCEDURE [policy].[UpdateIndividualPolicyPremium] (@policyId int, @userId varchar(64))
as begin

	--declare @policyId int = 22065
	--declare @userId varchar(64) = 'system@randmutual.co.za'

	set nocount on

	begin tran trxUpdateIndividualPremium 

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
		where c.[PolicyId] = @policyId

		declare @insured_life table (
			ParentPolicyId int,
			PolicyId int,
			IsGroupPolicy bit,
			RolePlayerId int,
			RolePlayerTypeId int,
			InsuredLifeStatusId int,
			BenefitId int,
			Rate decimal(18, 10),
			primary key (ParentPolicyId, PolicyId, RolePlayerId)
		)

		insert into @insured_life
			select isnull(p.ParentPolicyId, 0) [ParentPolicyId],
				p.PolicyId,
				iif(isnull(c.RolePlayerId, 0) > 0, 1, 0) [IsGroupPolicy],
				pil.RolePlayerId,
				pil.RolePlayerTypeId,
				pil.InsuredLifeStatusId,
				isnull(t.BenefitId, 0) [BenefitId],
				isnull(case pil.InsuredLifeStatusId when 1 then t.BaseRate else 0 end, 0) [BaseRate]
			from [policy].[Policy] p with (nolock)
				inner join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = p.PolicyId
				inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = pil.RolePlayerId
				left join client.Person per with (nolock) on per.RolePlayerId = pil.RolePlayerId
				left join client.Company c with (nolock) on c.RolePlayerId = p.PolicyPayeeId
				left join (
					select BenefitId, BaseRate, Rank() over (partition by BenefitId order by EffectiveDate desc) [Rank]
					from product.BenefitRate with (nolock)
				) t on t.BenefitId = pil.StatedBenefitId
			where p.PolicyId = @policyId
			  and t.[Rank] = 1

		declare @memberCount int
		select @memberCount = count(*) from @insured_life

		if (@memberCount > 0) begin
			declare @policy table (
				PolicyId int primary key not null,
				ParentPolicyId int,
				IsGroupPolicy bit,
				PaymentFrequencyId int,
				Multiplier decimal(6,1),
				AdminFeePercentage decimal(6, 4),
				CommissionPercentage decimal(6, 4),
				BinderFeePercentage decimal(6, 4),
				PremiumAdjustmentPercentage decimal(6,4),
				BaseRate decimal(18, 10),
				MonthlyPremium money
			)

			insert into @policy
				select p.PolicyId,
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
					0
				from policy.Policy p with (nolock)
					inner join @insured_life i on i.PolicyId = p.PolicyId
				where i.InsuredLifeStatusId = 1
				group by p.PolicyId,
					i.ParentPolicyId,
					i.IsGroupPolicy,
					p.PaymentFrequencyId,
					p.AdminPercentage,
					p.CommissionPercentage,
					p.BinderFeePercentage,
					p.PremiumAdjustmentPercentage

			update @policy set 
				MonthlyPremium = round(policy.CalculateGroupPolicyPremium(BaseRate, AdminFeePercentage, CommissionPercentage, BinderFeePercentage, PremiumAdjustmentPercentage), 0) 
				where IsGroupPolicy = 1
			update @policy set 
				MonthlyPremium = round(policy.CalculateIndividualPolicyPremium(BaseRate, AdminFeePercentage, CommissionPercentage, BinderFeePercentage), 2) 
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

			declare @parentPolicyId int
			select @parentPolicyId = ParentPolicyId from policy.Policy (nolock) where PolicyId = @policyId

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
					where p.[ParentPolicyId] = @parentPolicyId
					  and p.[IsDeleted] = 0
					  and am.[DoRaiseInstallementPremiums] = 1
					group by p.[ParentPolicyId]
				) t on t.[PolicyId] = p.[PolicyId]
		end
		commit tran trxUpdateIndividualPremium

	end try
	begin catch
		rollback tran trxUpdateIndividualPremium
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

	set nocount off

end