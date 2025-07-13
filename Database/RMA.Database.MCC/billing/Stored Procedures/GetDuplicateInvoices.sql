CREATE PROCEDURE [billing].[GetDuplicateInvoices]
/* =============================================
Name:			GetDuplicateInvoices
Description:	Get Duplicate Invoices
Author:			Sibahle Senda
Create Date:	2021-05-04
Change Date:	
Culprits:		
============================================= */
AS
BEGIN

declare @DuplicateInvoices TABLE(
    [InvoiceId]  [int] NOT NULL,
	[PolicyId] [int] NOT NULL,
	[Amount] [decimal](18, 2) NOT NULL,
	[InvoiceDate] [datetime] NOT NULL,
	[CreatedDate] [datetime] NOT NULL)

insert @DuplicateInvoices
select duplicates.InvoiceId, duplicates.PolicyId, duplicates.TotalInvoiceAmount, duplicates.InvoiceDate,
duplicates.CreatedDate
from
(
  Select *,
    row_number() over(partition by results.PolicyId, results.InvoiceDate
	order by  results.PolicyId, results.InvoiceDate, results.CreatedDate DESC) rn
  from (select distinct i.invoiceid, i.PolicyId, i.TotalInvoiceAmount, i.InvoiceDate, i.CreatedDate 
from billing.Invoice i
inner join [policy].[Policy] p on p.PolicyId = i.PolicyId
cross apply (SELECT i2.PolicyId, i2.InvoiceDate
FROM [billing].[Invoice] i2, [billing].[Transactions]  t2
where i2.InvoiceDate >= '2020-11-01' and t2.InvoiceId = i2.InvoiceId
and t2.TransactionTypeId = 6
GROUP BY i2.PolicyId, i2.InvoiceDate
HAVING COUNT(*) > 1) a
where i.invoicedate >= '2020-11-01' and i.policyid = p.policyid
and a.InvoiceDate = i.InvoiceDate and a.PolicyId = i.PolicyId
) results
) duplicates, [billing].[Transactions] t
where duplicates.rn > 1 and t.InvoiceId = duplicates.InvoiceId 
and t.TransactionTypeId = 6 and dbo.GetTransactionBalance(t.TransactionId) > 0

SELECT i.*
FROM @DuplicateInvoices i
ORDER BY i.[PolicyId], i.[InvoiceDate], i.[CreatedDate] ASC
END