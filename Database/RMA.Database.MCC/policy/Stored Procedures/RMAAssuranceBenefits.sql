CREATE PROCEDURE [policy].[RMAAssuranceBenefits]
	@PolicyId INT
	AS
BEGIN
	SELECT
		[Benefit].Code,
		[Benefit].[Name],
		[BenefitType].[Name] AS BenefitType,
		[CoverMemberType].[Name] AS CoverType,
		[Benefit].MinCompensationAmount,
		[Benefit].MaxCompensationAmount
	FROM [policy].[Policy]
	INNER JOIN [product].[ProductOptionBenefit] [ProductOptionBenefit] ON [ProductOptionBenefit].ProductOptionId = [Policy].ProductOptionId
	INNER JOIN [product].[Benefit] [Benefit] ON [Benefit].Id = [ProductOptionBenefit].BenefitId
	INNER JOIN [common].[BenefitType] [BenefitType] ON [BenefitType].Id = [Benefit].BenefitTypeId
	INNER JOIN [common].[CoverMemberType] [CoverMemberType] ON [CoverMemberType].Id = [Benefit].CoverMemberTypeId
	WHERE 
		[Policy].PolicyInceptionDate > [Benefit].StartDate 
		AND [Policy].PolicyInceptionDate <= COALESCE([Benefit].EndDate, GETDATE())
		AND [Policy].PolicyId = @PolicyId
END