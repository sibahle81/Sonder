
CREATE PROCEDURE [pension].[PensionIncreaseLetter]
				@LedgerId	int 
	
AS
BEGIN
	
	SET NOCOUNT ON;

    
SELECT        TOP (1) common.Title.Name + ' ' + client.Person.FirstName + ' ' + client.Person.Surname AS FullName, client.RolePlayerAddress.AddressLine1, client.RolePlayerAddress.AddressLine2, client.RolePlayerAddress.PostalCode, 
                         client.RolePlayerAddress.City, client.RolePlayerAddress.Province, pension.PensionRecipient.PersonId, client.Person.RolePlayerId, client.RolePlayerAddress.IsDeleted, common.Title.Name, 
                         common.Country.Name AS Country
FROM            client.Person INNER JOIN
                         client.RolePlayerAddress ON client.Person.RolePlayerId = client.RolePlayerAddress.RolePlayerId INNER JOIN
                         pension.PensionRecipient ON client.Person.RolePlayerId = pension.PensionRecipient.PersonId INNER JOIN
                         common.Title ON client.Person.TitleId = common.Title.Id INNER JOIN
                         common.Country ON client.RolePlayerAddress.CountryId = common.Country.Id
WHERE        (client.RolePlayerAddress.IsDeleted = 0)
END