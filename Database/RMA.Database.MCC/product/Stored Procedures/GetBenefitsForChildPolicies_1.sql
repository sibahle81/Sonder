
CREATE   PROCEDURE [product].[GetBenefitsForChildPolicies] @policyIds varchar(max)
AS BEGIN
	
	declare @policy table (
		PolicyId int primary key
	)
	insert into @policy
		select distinct [value] from OPENJSON(@policyIds)
	select distinct br.[ProductOptionId],
		br.[ProductOptionName],
		br.[BenefitId],
		br.[BenefitName],
		br.[BenefitCode],
		br.[CoverMemberTypeId] [CoverMemberType],
		br.[BenefitTypeId] [BenefitType],
		br.[MinimumAge],
		br.[MaximumAge],
		br.[BaseRate],
		br.[BenefitAmount]
	from @policy t
		inner join policy.Policy p (nolock) on p.PolicyId = t.PolicyId
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		inner join product.CurrentBenefitRate br (nolock) on 
			br.ProductOptionId = p.ProductOptionId and
			br.BenefitId = pil.StatedBenefitId
	order by br.CoverMemberTypeId,
		br.MinimumAge,
		br.BenefitName
END