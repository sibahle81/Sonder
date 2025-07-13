CREATE PROCEDURE [policy].[RMAAssuranceBenefits_Preview]
	@WizardId INT,
	@PolicyId INT
	AS
BEGIN

DECLARE @JSONData AS NVARCHAR(MAX)
SELECT @JSONData = WIZARD.[Data]
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId --56036

DECLARE   @QUOTEDATA TABLE (
			  PolicyId INT,
			  ProductOptionId INT,
			  PolicyInceptionDate Date
              )

    INSERT INTO @QUOTEDATA (PolicyId, ProductOptionId, PolicyInceptionDate)

	SELECT DISTINCT
		JSON_Value(c.value, '$.policyId') as PolicyId,
		JSON_Value(qd.value, '$.productOptionId') as ProductOptionId,
		JSON_Value(c.value, '$.policyInceptionDate') as PolicyInceptionDate
	FROM OPENJSON (@JSONData, '$[0]') as c
	CROSS APPLY OPENJSON (c.value, '$.quoteV2.quoteDetailsV2') as qd

	SELECT
	[Benefit].Code,
	[Benefit].[Name],
	[BenefitType].[Name] AS BenefitType,
	[CoverMemberType].[Name] AS CoverType,
	[Benefit].MinCompensationAmount,
	[Benefit].MaxCompensationAmount
	FROM @QUOTEDATA [QuoteData]
	INNER JOIN [product].[ProductOptionBenefit] [ProductOptionBenefit] ON [ProductOptionBenefit].ProductOptionId = [QuoteData].ProductOptionId
	INNER JOIN [product].[Benefit] [Benefit] ON [Benefit].Id = [ProductOptionBenefit].BenefitId
	INNER JOIN [common].[BenefitType] [BenefitType] ON [BenefitType].Id = [Benefit].BenefitTypeId
	INNER JOIN [common].[CoverMemberType] [CoverMemberType] ON [CoverMemberType].Id = [Benefit].CoverMemberTypeId
	WHERE 
	[QuoteData].PolicyInceptionDate > [Benefit].StartDate 
	AND [QuoteData].PolicyInceptionDate <= COALESCE([Benefit].EndDate, GETDATE())
	AND [QuoteData].PolicyId = @PolicyId
END