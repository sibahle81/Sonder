
--Gram Letoaba
--2022/10/10

CREATE PROCEDURE [policy].[GetCompaniesWithPolicy]

AS
BEGIN
	select 
		distinct rp.DisplayName AS DisplayName,
		         p.PolicyId
	from [policy].[Policy] p
	inner join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
	inner join [client].[roleplayer] rp on rp.RolePlayerId = paPol.policyOwnerId
	where rp.[RolePlayerIdentificationTypeId] = 2
	order by 1 
END