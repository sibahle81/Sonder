
CREATE PROCEDURE [policy].[ExpenseBasedPolicyScheduleProductName]
	@WizardId INT 
	AS

	--Declare @WizardId INT 
 --   Set @WizardId = 54439 -- 46534
BEGIN

DECLARE
	@jsonData NVARCHAR(MAX)

	create table #QuoteData
	(
		quoteId INT,
		categoryInsured varchar(50),
		averageEmployeeCount int,
		averageEarnings decimal(18,2),
		premium decimal(18,2),
		rate decimal(18,2),
		productOptionName varchar(50),
		policyNumber varchar(50)
	)

	insert into #QuoteData
	select 
		quoteId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].quote.quoteId')),
		CategoryInsured = CI.[Name],
		averageEmployeeCount = CONVERT(INT, json_value(WIZARD.[Data], '$[0].quote.averageEmployeeCount')),
		averageEarnings = CONVERT(decimal(18,2), json_value(WIZARD.[Data], '$[0].quote.averageEarnings')),
		premium = CONVERT(decimal(18,2), json_value(WIZARD.[Data], '$[0].quote.premium')),
		rate = CONVERT(decimal(18,2), json_value(WIZARD.[Data], '$[0].quote.rate')),
		productOptionName = PO.[Name],
		policyNumber = CONVERT(varchar(50), json_value(WIZARD.[Data], '$[0].policyNumber'))

	FROM [bpm].[Wizard] WIZARD
	inner join product.ProductOption PO
	on PO.Id = json_value(WIZARD.[Data], '$[0].quote.productOptionId')
	inner join common.categoryInsured CI
	on CI.Id = json_value(WIZARD.[Data], '$[0].quote.categoryInsured')
	WHERE WIZARD.[Id] = @WizardId

	SELECT @jsonData = [Data] FROM bpm.Wizard WHERE Id = @WizardId
	insert into #QuoteData
	select
		JsonData.quoteId,
		CI.[Name],
		JsonData.averageEmployeeCount,
		JsonData.averageEarnings,
		JsonData.premium,
		JsonData.rate,
		PO.[Name],
		JsonData.policyNumber

    FROM OpenJson(@jsonData, '$[0].quote.dependentQuotes')
	with(
	quoteId					int			   '$.quote.quoteId',
	categoryInsured			varchar(50)    '$.quote.categoryInsured',
	averageEmployeeCount	int		       '$.quote.averageEmployeeCount',
	averageEarnings			decimal(18,2)  '$.quote.averageEarnings',
	premium				    decimal(18,2)  '$.quote.premium',
	rate					decimal(18,2)  '$.quote.rate',
	productOptionId		varchar(50)        '$.quote.productOptionId',
	policyNumber		varchar(50)        '$.policyNumber'
) as JsonData 
	inner join product.ProductOption PO
	on PO.Id = JsonData.productOptionId
		inner join common.categoryInsured CI
	on CI.Id = JsonData.categoryInsured

    SELECT STRING_AGG(productOptionName, ', ') AS ProductName, 
	       STRING_AGG(policyNumber, ', ') AS PolicyNumber
	FROM #QuoteData
	
	drop table #QuoteData
END