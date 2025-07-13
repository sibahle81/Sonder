CREATE   PROCEDURE [policy].[SearchPolicies] @search varchar(128)
AS BEGIN

	declare @policy table (
		Id int identity not null primary key,
		PolicyId int
	)

	insert into @policy (PolicyId) select p.PolicyId from Policy.Policy p (nolock) where PolicyNumber like '%' + @search + '%'
	insert into @policy (PolicyId) select p.PolicyId from Policy.Policy p (nolock) where ClientReference like '%' + @search + '%'
	insert into @policy (PolicyId) select p.PolicyId from policy.Policy p (nolock) inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId where rp.DisplayName like '%' + @search + '%'
	insert into @policy (PolicyId) select p.PolicyId from policy.Policy p (nolock) inner join client.Company co (nolock) on co.RolePlayerId = p.PolicyOwnerId where co.[Name] like '%' + @search + '%'
	insert into @policy (PolicyId) select p.PolicyId from policy.Policy p (nolock) inner join client.Company co (nolock) on co.RolePlayerId = p.PolicyOwnerId where co.[ReferenceNumber] like '%' + @search + '%'
	insert into @policy (PolicyId) select p.PolicyId from policy.Policy p (nolock) inner join client.Company co (nolock) on co.RolePlayerId = p.PolicyOwnerId where co.[CompensationFundReferenceNumber] like '%' + @search + '%'
	insert into @policy (PolicyId) select p.PolicyId from policy.Policy p (nolock) inner join client.Company co (nolock) on co.RolePlayerId = p.PolicyOwnerId where co.[IdNumber] like '%' + @search + '%'
	insert into @policy (PolicyId) select p.PolicyId from policy.Policy p (nolock) inner join client.FinPayee fp (nolock) on fp.RolePlayerId = p.PolicyOwnerId where fp.[FinPayeNumber] like '%' + @search + '%'
	insert into @policy (PolicyId) select p.PolicyId from policy.Policy p (nolock) inner join policy.PolicyMovements pm (nolock) on pm.[PolicyMovementId] = p.[PolicyMovementId] where pm.[MovementRefNo] like '%' + @search + '%'

	insert into @policy (PolicyId)
		select p.PolicyId
		from policy.Policy p (nolock)
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = pil.RolePlayerId
		where rp.DisplayName like '%' + @search + '%'

	insert into @policy (PolicyId)
		select p.PolicyId
		from policy.Policy p (nolock)
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = pil.RolePlayerId
		where rp.CellNumber like '%' + @search + '%'

	insert into @policy (PolicyId)
		select p.PolicyId
		from policy.Policy p (nolock)
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = pil.RolePlayerId
		where  rp.EmailAddress like '%' + @search + '%'

	insert into @policy (PolicyId) 
		select p.PolicyId
		from policy.Policy p (nolock)
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
		where per.IdNumber like '%' + @search + '%'

	insert into @policy (PolicyId) 
		select p.PolicyId
		from policy.Policy p (nolock)
		inner join client.RolePlayerRelation rr (nolock) on rr.PolicyId = p.PolicyId
		inner join client.Person per (nolock) on per.RolePlayerId = rr.FromRolePlayerId
		where per.IdNumber like '%' + @search + '%'

	select distinct top 1200 PolicyId from @policy

END