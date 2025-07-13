
CREATE   PROCEDURE [product].[GetBenefitsForParentPolicy] @parentPolicyId int
AS BEGIN

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
	from policy.Policy p (nolock)
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		inner join product.CurrentBenefitRate br (nolock) on 
			br.ProductOptionId = p.ProductOptionId and
			br.BenefitId = pil.StatedBenefitId
	where p.ParentPolicyId = @parentPolicyId
	order by br.CoverMemberTypeId,
		br.MinimumAge,
		br.BenefitName
END