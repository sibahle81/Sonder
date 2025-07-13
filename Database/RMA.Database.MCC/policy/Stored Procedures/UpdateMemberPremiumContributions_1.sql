CREATE PROCEDURE [policy].[UpdateMemberPremiumContributions]
	@policyId int,
	@rolePlayerId int,
	@calculationDate date
AS BEGIN

	-- ALGORITHM COPIED FROM [policy].[UpdateChildPolicyPremiums] WITH SOME MODIFICATIONS
	-- THAT PREVENT US FROM JUST USING THE OTHER ONE
	-- 1. Exclude contributions from @rolePlayerId
	-- 2. Use @calculationDate to find the correct benefit rate

	declare @userId varchar(32) = 'system@randmutual.co.za'

	begin tran trxUpdatePremiumContributions

	begin try
		
		declare @premiums table (
			[PolicyId] int,
			[IsGroupPolicy] bit,
			[RolePlayerId] int,
			[IsMainMember] bit,
			[BenefitId] int,
			[BaseRate] decimal(18,10),
			[AdminPercentage] float,
			[ServicePercentage] float,
			[BinderFeePercentage] float,
			[PremiumAdjustmentPercentage] decimal(18,10),
			[Premium] money,
			[EuropAssistFee] money,
			[Multiplier] float,
			primary key ([PolicyId], [RolePlayerId])
		)
		declare @policies table (
			[PolicyId] int not null primary key
		)

		-- Update the child policies' admin and commission percentages
		update c set
			c.[AdminPercentage] = p.[AdminPercentage],
			c.[CommissionPercentage] = p.[CommissionPercentage],
			c.[BinderFeePercentage] = p.[BinderFeePercentage],
			c.[PremiumAdjustmentPercentage] = p.[PremiumAdjustmentPercentage],
			c.[ModifiedBy] = @userId,
			c.[ModifiedDate] = getdate(),
			c.[IsEuropAssist] = p.[IsEuropAssist],
			c.[EuropAssistEffectiveDate] = p.[EuropAssistEffectiveDate],
			c.[EuropAssistEndDate] = p.[EuropAssistEndDate]
		from [policy].[Policy] p
			inner join [policy].[Policy] c on c.[ParentPolicyId] = p.[PolicyId]
		where p.[PolicyId] = @policyId

		-- Get the details of all the active insured lives in the child policies
		insert into @premiums		
		select p.[PolicyId],
			case isnull(p.[ParentPolicyId], -1) when -1 then 0 else 1 end [IsGroupPolicy],
			pil.[RolePlayerId],
			iif(pil.[RolePlayerTypeId] = 10, 1, 0),
			pil.[StatedBenefitId],
			t.[BaseRate],
			p.[AdminPercentage],
			p.[CommissionPercentage],
			p.[BinderFeePercentage],
			p.[PremiumAdjustmentPercentage],
			0.00,
			iif(p.[IsEuropAssist] = 1 and pil.[RolePlayerTypeId] = 10, [policy].[GetEuropAssistFee](p.[CommissionPercentage]), 0.0),
			case p.[PaymentFrequencyId] 
				when 1 then 12.0	-- Annually
				when 2 then 1.0		-- Monthly
				when 3 then 4.0		-- Quarterly
				else 6.0			-- BiAnnually
			end
		from [policy].[Policy] p with (nolock)
			inner join [policy].[PolicyInsuredLives] pil with (nolock) on pil.[PolicyId] = p.[PolicyId]
			inner join [client].[RolePlayer] rp with (nolock) on rp.[RolePlayerId] = pil.[RolePlayerId]
			left join [client].[Person] per with (nolock) on per.[RolePlayerId] = pil.[RolePlayerId]
			left join (
				select br.[BenefitId],
					br.[BaseRate],
					rank() over (partition by br.[BenefitId] order by br.[EffectiveDate] desc) [Rank]
				from [product].[Benefit] b with (nolock)
					inner join [product].[BenefitRate] br with (nolock) on br.[BenefitId] = b.[Id]
				where b.[IsDeleted] = 0
				  and br.[IsDeleted] = 0
				  and cast (br.[EffectiveDate] as date) <= @calculationDate
			) t on t.[BenefitId] = pil.[StatedBenefitId] and t.[Rank] = 1
		where p.[ParentPolicyId] = @policyId
		  and pil.[InsuredLifeStatusId] = 1
		  and p.[PolicyOwnerId] <> @rolePlayerId
		  and pil.[RolePlayerId] <> @rolePlayerId
		  and rp.[IsDeleted] = 0
		  and isnull(per.[IsDeleted], rp.[IsDeleted]) = 0

		-- Remove the policies where the benefits are not defined
		insert into @policies select distinct [PolicyId] from @premiums where [BenefitId] is null
		delete from @premiums where [PolicyId] in (select [PolicyId] from @policies) 

		-- Update the premiums of the child policies in the temporary table
		update @premiums set Premium = round([policy].[CalculateGroupPolicyPremium](BaseRate, AdminPercentage, ServicePercentage, BinderFeePercentage, PremiumAdjustmentPercentage) + EuropAssistFee, 0) where [IsGroupPolicy] = 1
		update @premiums set Premium = round([policy].[CalculateIndividualPolicyPremium](BaseRate, AdminPercentage, ServicePercentage, BinderFeePercentage) + EuropAssistFee, 0) where [IsGroupPolicy] = 0

		-- Update the child policy premiums
		update p set
			p.[AnnualPremium] = t.[AnnualInstallment],
			p.[InstallmentPremium] = t.[MonthlyInstallment],
			p.[ModifiedBy] = @userId,
			p.[ModifiedDate] = getdate()
		from [policy].[Policy] p
			inner join (
				select PolicyId,
					cast(sum(Premium * 12.0) as money) [AnnualInstallment],
					cast(sum(Premium * Multiplier) as money) [MonthlyInstallment]
				from @premiums
				group by PolicyId
			) t on t.[PolicyId] = p.[PolicyId]

		-- Update the parent policy premium
		update p set
			p.[AnnualPremium] = t.[AnnualPremium],
			p.[InstallmentPremium] = t.[InstallmentPremium],
			p.[ModifiedBy] = @userId,
			p.[ModifiedDate] = getdate()
		from [policy].[Policy] p
			inner join (
				select p.[ParentPolicyId] [PolicyId],
					sum(p.[AnnualPremium]) [AnnualPremium],
					sum(p.[InstallmentPremium]) [InstallmentPremium]
				from [policy].[Policy] p with (nolock)
					inner join [policy].[PolicyStatusActionsMatrix] am with (nolock) on am.PolicyStatus = p.PolicyStatusId
				where p.[ParentPolicyId] = @policyId
				  and p.[PolicyOwnerId] <> @rolePlayerId
				  and p.[IsDeleted] = 0
				  and am.[DoRaiseInstallementPremiums] = 1
				group by p.[ParentPolicyId]
			) t on t.[PolicyId] = p.[PolicyId]

		commit tran trxUpdatePremiumContributions

	end try
	begin catch
		rollback tran trxUpdatePremiumContributions
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

end
