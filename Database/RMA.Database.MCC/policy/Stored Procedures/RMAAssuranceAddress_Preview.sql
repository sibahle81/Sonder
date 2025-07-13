CREATE PROCEDURE [policy].[RMAAssuranceAddress_Preview]
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
	JSON_Value(c.value, '$.policyOwnerId') as PolicyOwnerId
	FROM OPENJSON (@JSONData, '$[0]') as c
	CROSS APPLY OPENJSON (c.value, '$.quoteV2.quoteDetailsV2') as qd

	SELECT
	[Address].AddressLine1,
	[Address].AddressLine2,
	[Address].PostalCode,
	[Address].City
	FROM @QUOTEDATA [QuoteData]
	INNER JOIN [client].RolePlayerAddress [Address] ON [Address].RoleplayerId = [QuoteData].PolicyOwnerId
	WHERE [Address].AddressTypeId = 1 --postal
END