-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/15
-- =================================================================
CREATE PROCEDURE [billing].[InvoiceAuditStandard]
	@InvoiceNumber AS VARCHAR(50)
AS 
BEGIN  

CREATE TABLE #Temp_Audit ( 
[Payee] VARCHAR(50),
[Invoice Date] DATE,
[Collection Date] DATE,
[Transaction Type] VARCHAR(50),
[Invoice Number] VARCHAR(50), 
[Amount] Decimal,
[Status] VARCHAR(50),
[Created By] VARCHAR(50),
[Created Date] DATETIME,
[Last Modified By] VARCHAR(50),
[Last Modified Date] DATETIME
)

INSERT INTO #Temp_Audit
SELECT
[ROLEPLAYER].DisplayName AS [Payee],
[INVOICE].InvoiceDate AS [Invoice Date],
[INVOICE].CollectionDate AS [Collection Date],
[TYPE].Name AS [Transaction Type],
[INVOICE].InvoiceNumber AS [Invoice Number],
[TRASACTIONS].Amount,

CASE
    WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate < GETDATE() THEN 'Pending'
	WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate >= GETDATE() THEN 'Pending'
	WHEN [TYPE].Name = 'Payment' AND [TRASACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRASACTIONS].Amount <= 0) THEN 'Paid'
	WHEN [TYPE].Name = 'Payment' AND [TRASACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRASACTIONS].Amount > 0) THEN 'Partially Paid'
	WHEN [TYPE].Name = 'Payment' AND [TRASACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRASACTIONS].Amount <= 0) THEN 'Paid'
	WHEN [TYPE].Name = 'Payment' AND [TRASACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRASACTIONS].Amount > 0) THEN 'Partially Paid'
    ELSE 'Unknown'
END AS [Status],

[TRASACTIONS].CreatedBy AS [Created By],
[TRASACTIONS].CreatedDate AS [Created Date],
[TRASACTIONS].ModifiedBy AS [Last Modified By],
[TRASACTIONS].ModifiedDate AS [Last Modified Date]
FROM billing.Transactions [TRASACTIONS]
INNER JOIN common.TransactionType [TYPE] ON [TRASACTIONS].TransactionTypeId = [TYPE].Id
INNER JOIN billing.Invoice [INVOICE] ON [TRASACTIONS].InvoiceId = [INVOICE].InvoiceId 
INNER JOIN client.FinPayee [FINPAYEE] ON [TRASACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRASACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
INNER JOIN common.[InvoiceStatus] [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
WHERE [INVOICE].InvoiceNumber = @InvoiceNumber


INSERT INTO #Temp_Audit
SELECT
[ROLEPLAYER].DisplayName AS [Payee],
[INVOICE].InvoiceDate AS [Invoice Date],
[INVOICE].CollectionDate AS [Collection Date],
'Manual Payment Allocation' AS [Transaction Type],
[INVOICE].InvoiceNumber AS [Invoice Number],
[ALLOCATION].Amount,

CASE
    WHEN ([ALLOCATION].Amount) >= [INVOICE].TotalInvoiceAmount THEN 'Paid'
	WHEN ([ALLOCATION].Amount) < [INVOICE].TotalInvoiceAmount THEN 'Parcially Paid'
    ELSE 'Unknown'
END AS [Status],

[ALLOCATION].CreatedBy AS [Created By],
[ALLOCATION].CreatedDate AS [Created Date],
[ALLOCATION].ModifiedBy AS [Last Modified By],
[ALLOCATION].ModifiedDate AS [Last Modified Date]

FROM billing.Transactions [TRASACTIONS]
INNER JOIN common.TransactionType [TYPE] ON [TRASACTIONS].TransactionTypeId = [TYPE].Id
INNER JOIN billing.Invoice [INVOICE] ON [TRASACTIONS].InvoiceId = [INVOICE].InvoiceId 
INNER JOIN client.FinPayee [FINPAYEE] ON [TRASACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRASACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
INNER JOIN common.[InvoiceStatus] [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
FULL OUTER JOIN billing.InvoiceAllocation [ALLOCATION] ON [INVOICE].InvoiceId = [ALLOCATION].InvoiceId
WHERE [INVOICE].InvoiceNumber = @InvoiceNumber AND [TRASACTIONS].ModifiedBy != 'BackendProcess'

SELECT * FROM #Temp_Audit

DROP TABLE #Temp_Audit

END  
