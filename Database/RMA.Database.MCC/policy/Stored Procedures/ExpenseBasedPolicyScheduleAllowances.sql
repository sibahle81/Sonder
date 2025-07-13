CREATE PROCEDURE [policy].[ExpenseBasedPolicyScheduleAllowances]
	@WizardId INT
	AS
BEGIN

--DECLARE
--	@WizardId INT
--Set @WizardId = 54439

DECLARE @JSONData AS NVARCHAR(MAX)
SELECT @JSONData =WIZARD.[Data] 
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId

	DECLARE   @QUOTEDATA TABLE (
			  AllowanceTypeId INT,
			  Allowance Decimal(18,2))

       INSERT INTO @QUOTEDATA (AllowanceTypeId,Allowance)


	SELECT
		JSON_Value (da.value, '$.allowanceType') as AllowanceTypeId,
		JSON_Value (da.value, '$.allowance') as Allowance
	FROM OPENJSON (@JSONData, '$') as c
	CROSS APPLY OPENJSON (c.value, '$.policyOwner.declarations[0].declarationAllowances') as da

	SELECT 
	[QuoteData].Allowance,
	[AllowanceType].[Name] AS AllowanceType
	FROM @QUOTEDATA [QuoteData]
	INNER JOIN [common].AllowanceType [AllowanceType] On AllowanceType.Id = [QuoteData].AllowanceTypeId
END