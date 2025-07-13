
CREATE PROCEDURE [policy].[COIDPolicyScheduleJSONPaymentTerms]
	@WizardId INT 
	AS

--Declare @WizardId INT 
--Set @WizardId = 64161 --46941 


BEGIN

DECLARE
	@jsonData NVARCHAR(MAX),
	@quoteId INT,
	@policyOwnerId INT,
	@productId INT,
	@productOptionId INT
	

SELECT @jsonData = [Data] FROM bpm.Wizard WHERE Id = @WizardId

SELECT
	@quoteId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].quoteId')),
	@policyOwnerId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].policyOwnerId')),
	@productId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].quote.productId')),
	@productOptionId = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].quote.productOptionId'))
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId

	select SUM(Premium) as TotalPremium from [quote].[QuoteDetail] where quoteId = @quoteId

END