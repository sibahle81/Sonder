CREATE PROCEDURE [billing].[GetInvoiceAllocations]
/* =============================================
Name:			GetInvoiceAllocations
Description:	GetInvoiceAllocations
Author:			Sibahle Senda
Create Date:	2021-05-25
Change Date:	
Culprits:		
============================================= */
@invoiceId int
AS
BEGIN

declare @InvoiceAllocations TABLE(
    [InvoiceAllocationId] [int],
	[TransactionId] [int],
	[CreatedDate] [datetime],
	[CreatedBy] [varchar](50),
	[ModifiedBy] [varchar](50),
	[ModifiedDate] [datetime],
	[InvoiceId] [int] NULL,
	[Amount] [decimal](18, 2),
	[ClaimRecoveryId] [int])

insert @InvoiceAllocations 
select ia.InvoiceAllocationId, ia.TransactionId, ia.CreatedDate, ia.CreatedBy, ia.ModifiedBy, ia.ModifiedDate, ia.InvoiceId, ia.Amount, ia.ClaimRecoveryId
from [billing].[InvoiceAllocation] ia
where ia.InvoiceId = @invoiceId

SELECT *
FROM @InvoiceAllocations
ORDER BY [CreatedDate] ASC
END