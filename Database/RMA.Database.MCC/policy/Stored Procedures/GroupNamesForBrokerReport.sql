
create   PROCEDURE [policy].[GroupNamesForBrokerReport]

	@brokerName varchar(100)

AS
BEGIN
 	select distinct rp.DisplayName AS Schemename 
	from [policy].[Policy] p
	inner join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
	inner join [client].[roleplayer] rp on rp.RolePlayerId = paPol.policyOwnerId
	inner join [broker].brokerage b on p.brokerageid = b.id
	where rp.[RolePlayerIdentificationTypeId] = 2 
	and b.[Name] = @brokerName
	order by 1 
END