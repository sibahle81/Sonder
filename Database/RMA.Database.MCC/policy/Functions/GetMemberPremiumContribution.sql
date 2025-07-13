CREATE FUNCTION [policy].[GetMemberPremiumContribution] (
    @policyId int,
	@rolePlayerId int,
	@calculationDate date) 
returns DECIMAL (18, 2) 
AS BEGIN

	declare @benefitId int 
	declare @rate money
	declare @premiumContribution decimal(18,2)

	select @benefitId = isnull([StatedBenefitId], 0.0)
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
		and [EffectiveDate] <= @calculationDate
	) t

	select @premiumContribution =  iif(p.[ParentPolicyId] is null, 
		[policy].[CalculateIndividualPolicyPremium](@rate, p.[AdminPercentage], p.[CommissionPercentage], p.[BinderFeePercentage]), 
		[policy].[CalculateGroupPolicyPremium](@rate, p.[AdminPercentage], p.[CommissionPercentage], p.[BinderFeePercentage], 0.0)
	)
	from [policy].[Policy] p with (nolock)
	where p.[PolicyId] = @policyId
	return @premiumContribution
END