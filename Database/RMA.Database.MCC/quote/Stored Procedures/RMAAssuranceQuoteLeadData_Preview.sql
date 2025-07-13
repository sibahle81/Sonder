CREATE PROCEDURE [quote].[RMAAssuranceQuoteLeadData_Preview]
	@WizardId INT
	AS
BEGIN
DECLARE @LeadId INT

DECLARE @JSONData AS NVARCHAR(MAX)
SELECT @JSONData =WIZARD.[Data] 
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId

	SET @LeadId = (SELECT JSON_Value (c.value, '$.leadId') as LeadId
	FROM OPENJSON (@JSONData, '$') as c)

	SELECT *
	FROM [lead].[Lead] [LEAD]
	WHERE LeadId = @LeadId
END