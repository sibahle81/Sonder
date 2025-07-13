/* =============================================
Name:			GetUnsettledInvoices
Description:	Get Unsettled Invoices
Author:			Sibahle Senda
Create Date:	2021-07-06
Change Date:	
Culprits:		
============================================= */
CREATE PROCEDURE [billing].[GetUnsettledInvoices]
@roleplayerId int
AS
BEGIN

declare @UnsettledInvoices TABLE(
    [InvoiceId]  int NOT NULL,
	[PolicyId] [int] NOT NULL,
	[Amount] [decimal](18, 2) NOT NULL,
	[InvoiceDate] [datetime] NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[Balance] [decimal](18, 2) NOT NULL,
	[InvoiceStatus]  [int] NOT NULL,
	[InvoiceNumber] varchar(50) NOT NULL,
	[TotalInvoiceAmount] decimal (18,2) NOT NULL,
	IsDeleted bit
	)

insert @UnsettledInvoices
select unsettledInvoices.InvoiceId, unsettledInvoices.PolicyId, unsettledInvoices.TotalInvoiceAmount, unsettledInvoices.InvoiceDate,
unsettledInvoices.CreatedDate, dbo.GetTransactionBalance(t.TransactionId) [Balance], i.InvoiceStatusId [InvoiceStatus], i.InvoiceNumber, i.TotalInvoiceAmount, i.IsDeleted
from [billing].[Invoice] unsettledInvoices, [billing].[Transactions] t, [billing].[Invoice] i
where t.RolePlayerId = @roleplayerId and t.InvoiceId = unsettledInvoices.InvoiceId and i.InvoiceId = t.InvoiceId
and t.TransactionTypeId = 6 and dbo.GetTransactionBalance(t.TransactionId) > 0
and i.IsDeleted <>1

SELECT i.*
FROM @UnsettledInvoices i
ORDER BY i.[PolicyId], i.[InvoiceDate], i.[CreatedDate] ASC
END