

-- =============================================
-- Author:		WhoCares
-- =============================================
CREATE PROCEDURE [billing].[SearchUnpaidInvoices]
	@search VARCHAR(255) 
	as
BEGIN
select i.InvoiceId, 
		p.PolicyNumber, 
        i.CollectionDate, 
        i.TotalInvoiceAmount,
         i.InvoiceStatusId,
        i.InvoiceNumber, 
        rp.DisplayName,
	
		il.Amount - t.Amount as AmountOutstanding
		
		from policy.Policy p
left join client.RolePlayer rp on p.PolicyOwnerId = rp.RolePlayerId
left join client.Person rpp on rp.RolePlayerId = rpp.RolePlayerId
left join client.Company rpc on rp.RolePlayerId = rpc.RolePlayerId
right join billing.Invoice i on p.PolicyId = i.PolicyId
left join billing.InvoiceLineItems il on i.InvoiceId = il.InvoiceId
left join billing.Transactions t on i.InvoiceId = t.InvoiceId
where i.InvoiceStatusId = 2 or i.InvoiceStatusId = 4 and  (PolicyNumber like '%' +@search + '%' OR
			  rpp.IdNumber like '%' +@search + '%' OR
			  rpp.FirstName like '%' +@search + '%' OR
			  rpp.Surname  like '%' +@search + '%' OR
			  rpp.IdNumber  like '%' +@search + '%' OR
				rp.DisplayName  like '%' +@search + '%' OR
			 rpc.[Name]  like '%' +@search + '%' OR
			 rpc.ReferenceNumber  like '%' +@search + '%' OR
			 rpc.VatRegistrationNo  like '%' +@search + '%')
			  end
