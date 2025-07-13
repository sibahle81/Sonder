---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/02/01
---- EXEC [policy].[GroupNamesReport]
---- =============================================
CREATE   PROCEDURE [policy].[GroupNamesReport]

AS
BEGIN
	select 
		distinct rp.DisplayName AS Schemename
	from [policy].[Policy] p
	inner join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
	inner join [client].[roleplayer] rp on rp.RolePlayerId = paPol.policyOwnerId
	where rp.[IsNaturalEntity] = 0
	order by 1 
END
GO


