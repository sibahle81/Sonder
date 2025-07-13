CREATE   PROCEDURE [policy].[SearchAccounts] @search varchar(512)
AS BEGIN

	set @search = concat('%', @search, '%')

	declare @rolePlayer table (
		RolePlayerId int
	)

	insert into @rolePlayer select RolePlayerId from client.Person with (nolock) where IdNumber like @search
	insert into @rolePlayer select RolePlayerId from client.RolePlayer with (nolock) 
		where DisplayName like @search
		   or EmailAddress like @search
	insert into @rolePlayer select RolePlayerId from client.FinPayee with (nolock) where FinPayeNumber like @search
	insert into @rolePlayer select RolePlayerId from client.Company with (nolock)
		where [Name] like @search
		   or [ReferenceNumber] like @search
		   or [VatRegistrationNo] like @search
		   or [IdNumber] like @search

	insert into @rolePlayer select PolicyOwnerId from policy.Policy with (nolock) 
		where ClientReference like @search
		   or PolicyNumber like @search

	insert into @rolePlayer select p.PolicyOwnerId from policy.Policy p with (nolock)
		inner join billing.Invoice i with (nolock) on i.PolicyId = p.PolicyId
		where i.InvoiceNumber like @search

	select distinct rp.RolePlayerId,
		rp.DisplayName,
		rp.EmailAddress,
        f.FinPayeNumber,
        f.IndustryId,
        f.AuthorisedDate,
        f.AuthroisedBy,
        isnull(f.IsAuthorised, 0) [IsAuthorised]
	from @rolePlayer r
		inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = r.RolePlayerId
		left join client.FinPayee f with (nolock) on f.RolePlayerId = r.RolePlayerId

END