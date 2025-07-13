CREATE PROCEDURE [billing].[GetCancelledPolicyOutstandingInvoices]
/* =============================================
Name:			GetCancelledPolicyOutstandingInvoices
Description:	Get Cancelled Policy Outstanding Invoices
Author:			Sibahle Senda
Create Date:	2021-05-04
Change Date:	
Culprits:		
============================================= */
AS
BEGIN

declare @CancelledPolicyOutstandingInvoices TABLE(
    [InvoiceId]  [int] NOT NULL,
	[PolicyId] [int] NOT NULL,
	[Amount] [decimal](18, 2) NOT NULL,
	[Balance] [decimal](18, 2) NOT NULL,
	[InvoiceDate] [datetime] NOT NULL,
	[CreatedDate] [datetime] NOT NULL)

insert @CancelledPolicyOutstandingInvoices
select distinct top 100  i.invoiceid, i.PolicyId, i.TotalInvoiceAmount, dbo.GetTransactionBalance(t.TransactionId), i.InvoiceDate, i.CreatedDate 
from billing.Invoice i
inner join [policy].[Policy] p on p.PolicyId = i.PolicyId
inner join [billing].[Transactions] t on t.InvoiceId = i.InvoiceId 
where p.PolicyStatusId = 2 -- cancelled
and t.TransactionTypeId = 6 and dbo.GetTransactionBalance(t.TransactionId) > 0
and i.invoicedate >= p.CancellationDate

SELECT i.*
FROM @CancelledPolicyOutstandingInvoices i
ORDER BY i.[PolicyId], i.[InvoiceDate], i.[CreatedDate] ASC
END