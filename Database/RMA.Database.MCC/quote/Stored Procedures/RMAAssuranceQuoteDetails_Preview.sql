CREATE PROCEDURE [quote].[RMAAssuranceQuoteDetails_Preview]
	@WizardId INT
	AS
BEGIN

DECLARE @JSONData AS NVARCHAR(MAX)
SELECT @JSONData =WIZARD.[Data] 
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId -- 283319 -- @WizardId

	DECLARE   @QUOTEDATA TABLE (
			  QuotationNumber VARCHAR(50),
			  ProductOptionId INT,
			  CategoryInsuredId INT,
              AverageNumberOfEmployees INT,
              AverageEmployeeEarnings Decimal(18,2),
			  IndustryRate Decimal(18,4),
              Premium Decimal(18,2),
			  LiveInAllowance Decimal(18,2),
			  IsDeleted Bit
              )

    INSERT INTO @QUOTEDATA (QuotationNumber, ProductOptionId, CategoryInsuredId, AverageNumberOfEmployees, AverageEmployeeEarnings, IndustryRate, Premium, LiveInAllowance, IsDeleted)

	SELECT
		JSON_Value(c.value, '$.quotationNumber') as QuotationNumber,
		JSON_Value(qd.value, '$.productOptionId') as ProductOptionId,
		JSON_Value(qd.value, '$.categoryInsured') as CategoryInsuredId,
		JSON_Value(qd.value, '$.averageNumberOfEmployees') as AverageNumberOfEmployees,
		JSON_Value(qd.value, '$.averageEmployeeEarnings') as AverageEmployeeEarnings,
		JSON_Value(qd.value, '$.industryRate') as IndustryRate,
		JSON_Value(qd.value, '$.premium') as Premium,
		JSON_Value(qd.value, '$.liveInAllowance') as LiveInAllowance,
		JSON_Value(qd.value, '$.isDeleted') as IsDeleted
	FROM OPENJSON (@JSONData, '$') as c
	CROSS APPLY OPENJSON (c.value, '$.quoteDetailsV2') as qd

	SELECT 
	[QuoteData].QuotationNumber,
	[Product].[Name] AS Product,
	[Product].UnderwriterId AS Underwriter,
	[Product].ProductClassId AS ProductClassId,
	[CategoryInsured].[Id] AS CategoryInsuredId,
	[ProductOption].[Name] AS ProductOption,
	[CategoryInsured].[Name] AS CategoryInsuredName,
	[QuoteData].AverageNumberOfEmployees,
	[QuoteData].AverageEmployeeEarnings,
	[QuoteData].IndustryRate,
	[QuoteData].Premium,
	[QuoteData].LiveInAllowance,
	[QuoteData].IsDeleted
	FROM @QUOTEDATA [QuoteData]
	INNER JOIN [common].[CategoryInsured] [CategoryInsured] ON [QuoteData].CategoryInsuredId = [CategoryInsured].Id
	INNER JOIN [product].[ProductOption] [ProductOption] ON [QuoteData].ProductOptionId = [ProductOption].Id
	INNER JOIN [product].[Product] [Product] ON [Product].Id = [ProductOption].ProductId
	WHERE [QuoteData].IsDeleted <> 1
END