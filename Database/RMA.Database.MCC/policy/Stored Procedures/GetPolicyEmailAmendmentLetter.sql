CREATE PROCEDURE [policy].[GetPolicyEmailAmendmentLetter]
	@PolicyId int
as
begin
	SELECT TOP 1
		[PolicyNumber] = POL.PolicyNumber,
		[MainMemberName] = CONCAT(PER.FirstName , ' ', PER.Surname),
		RPC.EmailAddress,
		RPA.AddressLine1,
		RPA.AddressLine2,
		RPA.PostalCode
			FROM [POLICY].[POLICY] (NOLOCK) POL
			INNER JOIN [CLIENT].[PERSON] (NOLOCK) PER ON POL.PolicyOwnerId = PER.RolePlayerId
			INNER JOIN [CLIENT].[ROLEPLAYERADDRESS] (NOLOCK) RPA ON RPA.RolePlayerId = PER.RolePlayerId
			left join [client].[RolePlayerContact] (Nolock) RPC on RPC.RolePlayerId = RPA.RolePlayerId
	WHERE POL.PolicyId =@PolicyId
	ORDER BY 1 DESC
end