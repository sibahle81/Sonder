
CREATE   PROCEDURE [product].[GetCoverMemberTypeBenefitsForProductOption] (@productOptionId int, @coverMemberTypeId int)
AS BEGIN
	select distinct b.[ProductOptionId],
		b.[ProductOptionName],
		b.[BenefitId],
		b.[BenefitCode],
		b.[BenefitName],
		b.[CoverMemberTypeId] [CoverMemberType],
		b.[BenefitTypeId] [BenefitType],
		b.[MinimumAge],
		b.[MaximumAge],
		b.[BaseRate],
		b.[BenefitAmount]
	from [product].[CurrentBenefitRate] b
	where b.[ProductOptionId] = @productOptionId 
	  and b.[CoverMemberTypeId] = iif(isnull(@coverMemberTypeId, 0) = 0, b.[CoverMemberTypeId], @coverMemberTypeId)
	order by b.[CoverMemberTypeId],
		b.[MinimumAge],
		b.[BenefitName]
END