CREATE PROCEDURE [policy].[GetPolicyScheduleBeneficiaries] (@policyId int, @counter int)
as begin

	select concat(pn.[FirstName], ' ', pn.[Surname]) [BeneficiaryName],
		pn.[IdNumber],
		pn.[DateOfBirth]
	from [client].[RolePlayerRelation] rr
	  inner join [client].[Person] pn on pn.[RolePlayerId] = rr.[FromRolePlayerId]
	where rr.[PolicyId] = @policyId
	  and rr.[RolePlayerTypeId] = 41

end
