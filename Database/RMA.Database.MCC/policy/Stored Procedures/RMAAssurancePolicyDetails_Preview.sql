CREATE PROCEDURE [policy].[RMAAssurancePolicyDetails_Preview]
	@WizardId INT,
	@PolicyId INT
	AS
BEGIN

DECLARE @JSONData AS NVARCHAR(MAX)
SELECT @JSONData = WIZARD.[Data]
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId  --56036

	DECLARE @QUOTEDATA TABLE (
	PolicyId int,
	PolicyOwnerId int,
	PolicyNumber varchar(50),
	PolicyInceptionDate Date,
	ExpiryDate Date,
	PaymentFrequencyId int,
	DeclarationYear varchar(4),
	ProductOptionId INT,
	CategoryInsuredId INT,
	AverageNumberOfEmployees INT,
	AverageEmployeeEarnings Decimal(18,2),
	LiveInAllowance Decimal(18,2),
	IndustryRate Decimal(18,4),
	Premium Decimal(18,2),
	IsDeleted Bit
)

INSERT INTO @QUOTEDATA (PolicyId, PolicyOwnerId, PolicyNumber, PolicyInceptionDate, ExpiryDate, PaymentFrequencyId, DeclarationYear, ProductOptionId, CategoryInsuredId, AverageNumberOfEmployees, AverageEmployeeEarnings, LiveInAllowance, IndustryRate, Premium, IsDeleted)

SELECT
	JSON_Value(c.value, '$.policyId') as PolicyId,
	JSON_Value(c.value, '$.policyOwnerId') as PolicyOwnerId,
	JSON_Value(c.value, '$.policyNumber') as PolicyNumber,
	JSON_Value(c.value, '$.policyInceptionDate') as PolicyInceptionDate,
	JSON_Value(c.value, '$.expiryDate') as ExpiryDate,
	JSON_Value(c.value, '$.paymentFrequencyId') as PaymentFrequencyId,
	JSON_Value(rpd.value, '$.declarationYear') as DeclarationYear,
	JSON_Value(rpdd.value, '$.productOptionId') as ProductOptionId,
	JSON_Value(rpdd.value, '$.categoryInsured') as CategoryInsuredId,
	JSON_Value(rpdd.value, '$.averageNumberOfEmployees') as AverageNumberOfEmployees,
	JSON_Value(rpdd.value, '$.averageEmployeeEarnings') as AverageEmployeeEarnings,
	JSON_Value(rpdd.value, '$.liveInAllowance') as LiveInAllowance,
	JSON_Value(rpdd.value, '$.rate') as IndustryRate,
	JSON_Value(rpdd.value, '$.premium') as Premium,
	JSON_Value(rpdd.value, '$.isDeleted') as IsDeleted
FROM OPENJSON (@JSONData, '$[0]') as c
CROSS APPLY OPENJSON (c.value, '$.rolePlayerPolicyDeclarations') as rpd
CROSS APPLY OPENJSON (rpd.value, '$.rolePlayerPolicyDeclarationDetails') as rpdd
WHERE JSON_VALUE(rpd.value, '$.rolePlayerPolicyDeclarationStatus') = '1'

SELECT
	[Company].[Name],
	[Finpayee].FinPayeNumber,
	[Company].IdNumber AS [ReferenceNumber],
	[IndustryClass].[Name] AS [IndustryClass],
	[QuoteData].PolicyNumber,
	[QuoteData].PolicyInceptionDate,
	[QuoteData].ExpiryDate,
	[QuoteData].DeclarationYear,
	[ProductOption].[Name] AS ProductOption,
	[CategoryInsured].[Name] AS CategoryInsuredName,
	[QuoteData].AverageNumberOfEmployees,
	[QuoteData].AverageEmployeeEarnings,
	[QuoteData].LiveInAllowance,
	[QuoteData].IndustryRate,
	[QuoteData].Premium,
	(CASE 
		WHEN [QuoteData].PaymentFrequencyId = 1 THEN 1 
		WHEN [QuoteData].PaymentFrequencyId = 2 THEN 12 
		WHEN [QuoteData].PaymentFrequencyId = 3 THEN 4 
		WHEN [QuoteData].PaymentFrequencyId = 4 THEN 2 
		ELSE 1 
	END) AS Multiplier
FROM @QUOTEDATA [QuoteData]
INNER JOIN [client].[Company] [Company] ON [Company].RolePlayerId = [QuoteData].PolicyOwnerId
INNER JOIN [common].IndustryClass [IndustryClass] ON [IndustryClass].Id = [Company].IndustryClassId
INNER JOIN [common].[CategoryInsured] [CategoryInsured] ON [QuoteData].CategoryInsuredId = [CategoryInsured].Id
INNER JOIN [product].[ProductOption] [ProductOption] ON [QuoteData].ProductOptionId = [ProductOption].Id
INNER JOIN [client].[FinPayee] [Finpayee] ON [Finpayee].RolePlayerId = [QuoteData].PolicyOwnerId
 	WHERE [QuoteData].IsDeleted <> 1 AND [QuoteData].PolicyId = @PolicyId
END