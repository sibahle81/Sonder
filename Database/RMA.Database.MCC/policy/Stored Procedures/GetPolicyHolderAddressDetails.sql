
CREATE PROCEDURE [policy].[GetPolicyHolderAddressDetails]
	@PolicyId INT
AS

--Declare @PolicyId INT
--Set @PolicyId = 21804 -- 21804 -- 9840

BEGIN
	
	SELECT 
		pol.PolicyNumber,
		rp.DisplayName,
		rp.TellNumber,
		rp.CellNumber,
		rp.EmailAddress,
		rpa.AddressTypeId,
		adt.Name As 'AddressType',
		rpa.AddressLine1,
		rpa.AddressLine2,
		rpa.PostalCode,
		rpa.City,
		rpa.Province,
		rpa.CountryId,
		co.Name As 'Country',
		rpa.RolePlayerAddressId

		FROM [policy].[policy] pol
			Inner join [client].[Person] (NOLOCK) person ON pol.PolicyOwnerId = person.RolePlayerId
			Inner Join [client].[RolePlayer] (NOLOCK) rp ON pol.PolicyOwnerId = rp.RolePlayerId
			Inner Join [client].[RolePlayerAddress] (NOLOCK) rpa ON rpa.RolePlayerId = pol.PolicyOwnerId
			Inner Join [common].[AddressType] (NOLOCK) adt ON adt.Id = rpa.AddressTypeId
			Inner Join [common].[Country] (NOLOCK) co ON co.Id = rpa.CountryId
		WHERE pol.PolicyId = @PolicyId
END