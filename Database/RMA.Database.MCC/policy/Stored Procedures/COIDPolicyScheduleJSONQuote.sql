
CREATE PROCEDURE [policy].[COIDPolicyScheduleJSONQuote]
	@WizardId INT 
	AS


--Declare @WizardId INT 
--Set @WizardId = 46941 -- 46534

BEGIN

DECLARE
	@jsonData NVARCHAR(MAX)

	SELECT @jsonData = [Data] FROM bpm.Wizard WHERE Id = @WizardId

	select 
		CI.Name as 'CategoryInsured',
		JsonData.QuoteDetailId,
		JsonData.QuoteId,
		JsonData.CategoryInsured as 'CategoryInsuredId',
		JsonData.NumberOfEmployees,
		JsonData.Earnings,
		JsonData.premium,
		JsonData.rate,
		JsonData.Id,
		JsonData.IsActive,
		JsonData.IsDeleted
	from [common].[CategoryInsured] CI 
		INNER JOIN OPENJSON(@jsonData,'$[0].quote.quoteDetails')
		WITH( 
		QuoteDetailId		VARCHAR(20)		'$.quoteDetailId',
		QuoteId				INT				'$.quoteId',
		CategoryInsured		INT				'$.categoryInsured',
		NumberOfEmployees	INT				'$.numberOfEmployees',
		Earnings			DECIMAL(18,2)	'$.earnings',
		premium				DECIMAL(18,2)	'$.premium',
		rate				DECIMAL(18,2)	'$.rate',
		categoryInsuredId	INT				'$.categoryInsuredId',
		Id					INT				'$.id',
		IsActive			BIT				'$.isActive',
		IsDeleted			BIT				'$.isDeleted') as JsonData
		ON CI.Id = JsonData.categoryInsuredId
END