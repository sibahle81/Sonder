CREATE  PROCEDURE [policy].[GetPolicyPostalAddressAmendmentLetter]
	@PolicyId int
as
begin
	SELECT TOP 1
		[PolicyNumber] = POL.PolicyNumber,
		[MainMemberName] = CONCAT(PER.FirstName , ' ', PER.Surname),
		rpb.AccountNumber,
		rpb.BranchCode,
		RPA.AddressLine1,
		RPA.AddressLine2,
		RPA.PostalCode
			FROM [POLICY].[POLICY] (NOLOCK) POL
			INNER JOIN [CLIENT].[PERSON] (NOLOCK) PER ON POL.PolicyOwnerId = PER.RolePlayerId
			left join [client].RolePlayerBankingDetails (Nolock) rpb on PER.RolePlayerId = rpb.RolePlayerId 
			INNER JOIN [CLIENT].[ROLEPLAYERADDRESS] (NOLOCK) RPA ON RPA.RolePlayerId = PER.RolePlayerId
	WHERE POL.PolicyId =@PolicyId
	ORDER BY 1 DESC
end