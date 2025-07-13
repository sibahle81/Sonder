/* =============================================
Name:			GetUnsettledInvoicesForPolicies
Description:	Get Unsettled Invoices For Policies
Author:			Raymond Makwiyana
Create Date:	2024-02-12
Change Date:	
Culprits:		
============================================= */
CREATE PROCEDURE [billing].[GetUnsettledInvoicesForPolicies]
@policyIds NVARCHAR(MAX)
AS
BEGIN

declare @UnsettledInvoices TABLE(
    [InvoiceId]  [int] NOT NULL,
	[PolicyId] [int] NOT NULL,
	[Amount] [decimal](18, 2) NOT NULL,
	[InvoiceDate] [datetime] NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[Balance] [decimal](18, 2) NOT NULL,
	[InvoiceStatus]  [int] NOT NULL,
	[InvoiceNumber] varchar(50) NOT NULL,
	[TotalInvoiceAmount] decimal (18,2) NOT NULL,
	IsDeleted bit
	);

Declare @PolicyIdsTable TABLE (	[PolicyId] [int] NOT NULL);
insert into @PolicyIdsTable (PolicyId) SELECT value FROM STRING_SPLIT(@policyIds,'|');


insert @UnsettledInvoices
select unsettledInvoices.InvoiceId, unsettledInvoices.PolicyId, unsettledInvoices.TotalInvoiceAmount, unsettledInvoices.InvoiceDate,
unsettledInvoices.CreatedDate, dbo.GetTransactionBalance(t.TransactionId) [Balance], i.InvoiceStatusId [InvoiceStatus], i.InvoiceNumber, i.TotalInvoiceAmount, i.IsDeleted
from [billing].[Invoice] unsettledInvoices, [billing].[Transactions] t, [billing].[Invoice] i
where  t.InvoiceId = unsettledInvoices.InvoiceId and i.InvoiceId = t.InvoiceId and i.PolicyId in ( select pt.PolicyId as Id from @PolicyIdsTable as pt ) 
and t.TransactionTypeId = 6 and dbo.GetTransactionBalance(t.TransactionId) > 0
and i.IsDeleted <>1;

SELECT i.*
FROM @UnsettledInvoices i
ORDER BY i.[PolicyId], i.[InvoiceDate], i.[CreatedDate] ASC
END