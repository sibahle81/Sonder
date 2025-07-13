
CREATE PROCEDURE [client].[GetRolePlayerPrimaryAddress]
 @RolePlayerId INT -- 1009991
AS 
BEGIN 
	 SELECT top 1 
	 [ADDRESS].AddressLine1,
	 [ADDRESS].AddressLine2,
	 [ADDRESS].City,
	 [ADDRESS].PostalCode,
	 [ADDRESS].Province
	 FROM [client].[RolePlayerAddress] [ADDRESS]
	 INNER JOIN [client].RolePlayer [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [ADDRESS].RolePlayerId
	 WHERE 
	 [ROLEPLAYER].[RolePlayerId] = @RolePlayerId
	 AND [ADDRESS].IsPrimary = 1
	 ORDER BY EffectiveDate DESC
END