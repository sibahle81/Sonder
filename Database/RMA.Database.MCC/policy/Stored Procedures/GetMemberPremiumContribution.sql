CREATE PROCEDURE [policy].[GetMemberPremiumContribution]
	@policyId int,
	@rolePlayerId int,
	@calculationDate date
AS BEGIN

	declare @benefitId int 
	declare @rate money

	select @benefitId = isnull([StatedBenefitId], 0)
	from [policy].[PolicyInsuredLives] with (nolock)
	where [PolicyId] = @policyId
	  and [RolePlayerId] = @rolePlayerId

	select @rate = isnull(t.[BaseRate], 0.0)
	from (
		select [BenefitId],
		[BaseRate],
		rank() over (partition by [BenefitId] order by [EffectiveDate] desc) [Rank]
		from [product].[BenefitRate] with (nolock)
		where [BenefitId] = @benefitId
		  and [IsDeleted] = 0
		and [EffectiveDate] <= @calculationDate
	) t
	where [Rank] = 1

	select iif(p.[ParentPolicyId] is null, 
		[policy].[CalculateIndividualPolicyPremium](@rate, p.[AdminPercentage], p.[CommissionPercentage], p.[BinderFeePercentage]), 
		[policy].[CalculateGroupPolicyPremium](@rate, p.[AdminPercentage], p.[CommissionPercentage], p.[BinderFeePercentage])
	) [PremiumContribution]
	from [policy].[Policy] p with (nolock)
	where p.[PolicyId] = @policyId

END
