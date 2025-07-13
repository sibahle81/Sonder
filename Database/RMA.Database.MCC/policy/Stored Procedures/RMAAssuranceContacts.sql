CREATE PROCEDURE [policy].[RMAAssuranceContacts]
	@PolicyId INT
	AS
BEGIN
SELECT
	[Contact].Firstname + ' ' + [Contact].Surname AS ContactDisplayName,
	COALESCE ([Contact].ContactNumber, 'N/A') AS ContactNumber,
	COALESCE ([Contact].EmailAddress, 'N/A') AS ContactEmailAddress,
	COALESCE ([Contact].TelephoneNumber, 'N/A') AS ContactTelephoneNumber
	FROM [policy].[POLICY]
	INNER JOIN [client].RolePlayerContact [Contact] ON [Contact].RoleplayerId = [POLICY].PolicyOwnerId
	WHERE 
	[Contact].TitleId = 17 --Memb
END