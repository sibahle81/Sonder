CREATE PROCEDURE [policy].[RMAAssuranceAddress]
	@PolicyId INT
	AS
BEGIN
	SELECT
	[Address].AddressLine1,
	[Address].AddressLine2,
	[Address].PostalCode,
	[Address].City
	FROM [client].[RolePlayerAddress] [Address]
	INNER JOIN [client].[RolePlayerPolicyDeclaration] rpd  ON [Address].RoleplayerId = rpd.RolePlayerID
	JOIN [POLICY].[Policy] p on p.Policyid = rpd.PolicyID
	WHERE p.policyid=@PolicyId AND [Address].AddressTypeId = 2 --postal
END