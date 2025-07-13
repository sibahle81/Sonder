CREATE PROCEDURE [policy].[RMAAssuranceContacts_Preview]
	@WizardId INT,
	@PolicyId INT
	AS
BEGIN

DECLARE @JSONData AS NVARCHAR(MAX)
SELECT @JSONData = WIZARD.[Data]
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId --56036

	DECLARE   @QUOTEDATA TABLE (
			  PolicyOwnerId INT
              )

    INSERT INTO @QUOTEDATA (PolicyOwnerId)

	SELECT
	JSON_Value(c.value, '$.policyOwnerId')
	FROM OPENJSON (@JSONData, '$[0]') as c
	CROSS APPLY OPENJSON (c.value, '$.quoteV2.quoteDetailsV2') as qd

	SELECT
	[Contact].Firstname + ' ' + [Contact].Surname AS ContactDisplayName,
	COALESCE ([Contact].ContactNumber, 'N/A') AS ContactNumber,
	COALESCE ([Contact].EmailAddress, 'N/A') AS ContactEmailAddress,
	COALESCE ([Contact].TelephoneNumber, 'N/A') AS ContactTelephoneNumber
	FROM @QUOTEDATA [QuoteData]
	INNER JOIN [client].RolePlayerContact [Contact] ON [Contact].RoleplayerId = [QuoteData].PolicyOwnerId
	WHERE 
	[Contact].TitleId = 17 --Memb
END