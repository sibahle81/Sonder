-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/15
-- =================================================================
CREATE PROCEDURE [billing].[InvoiceAudit]
	@InvoiceNumber AS VARCHAR(50)
AS 
BEGIN  

CREATE TABLE #Temp_Audit
(
Audit_Text varchar(MAX)
)

INSERT INTO #Temp_Audit
SELECT
	CASE
		WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate < GETDATE() THEN [TYPE].Name + ' (' + [INVOICE].InvoiceNumber + ') for (R' + CONVERT(VARCHAR, [TRASACTIONS].Amount) + ') was raised on (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 108) + ') by (' + [TRASACTIONS].ModifiedBy + '). Payment was expected on or before (' + CONVERT(VARCHAR, [INVOICE].CollectionDate, 7) + '). Invoice status was set to (pending)'
		WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate >= GETDATE() THEN [TYPE].Name + ' (' + [INVOICE].InvoiceNumber + ') for (R' + CONVERT(VARCHAR, [TRASACTIONS].Amount) + ') was raised on (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 107) + ') at ' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 108) + ') by (' + [TRASACTIONS].ModifiedBy + '). Payment is expected by ' + CONVERT(VARCHAR, [INVOICE].CollectionDate, 7) + ' . Invoice status was set to (pending)'
		WHEN [TYPE].Name = 'Payment' AND [TRASACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRASACTIONS].Amount <= 0) THEN [TYPE].Name+ ' (' + [TRASACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRASACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 108) + ') and was automatically allocated (' + [TRASACTIONS].RmaReference + '). Invoice status was updated to (paid)'
		WHEN [TYPE].Name = 'Payment' AND [TRASACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRASACTIONS].Amount > 0) THEN [TYPE].Name+ ' (' + [TRASACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRASACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 108) + ') and was automatically allocated. Invoice status was updated to (partially paid)'
		WHEN [TYPE].Name = 'Payment' AND [TRASACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRASACTIONS].Amount <= 0) THEN [TYPE].Name+ ' (' + [TRASACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRASACTIONS].Amount) + ') was received on ( ' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 108) + ') and was allocated by (' + [TRASACTIONS].ModifiedBy + '). Invoice status was updated to (paid)'
		WHEN [TYPE].Name = 'Payment' AND [TRASACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRASACTIONS].Amount > 0) THEN [TYPE].Name+ ' (' + [TRASACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRASACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 108) + ') and was allocated by (' + [TRASACTIONS].ModifiedBy + '). Invoice status was updated to (partially paid)'
		ELSE [TYPE].Name+ ' (' + [TRASACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRASACTIONS].Amount) + ') was processed on (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRASACTIONS].CreatedDate, 108) + ') by (' + [TRASACTIONS].ModifiedBy + ')'
	END AS Audit_Text

FROM billing.Transactions [TRASACTIONS]
INNER JOIN common.TransactionType [TYPE] ON [TRASACTIONS].TransactionTypeId = [TYPE].Id
INNER JOIN billing.Invoice [INVOICE] ON [TRASACTIONS].InvoiceId = [INVOICE].InvoiceId 
INNER JOIN client.FinPayee [FINPAYEE] ON [TRASACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRASACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
INNER JOIN common.[InvoiceStatus] [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
WHERE [INVOICE].InvoiceNumber = 'INV:000782'

INSERT INTO #Temp_Audit
SELECT
	CASE
		WHEN ([ALLOCATION].Amount >= [INVOICE].TotalInvoiceAmount) AND [ALLOCATION].ModifiedBy != 'BackendProcess' THEN '(R' + CONVERT(VARCHAR, [ALLOCATION].Amount) + ') was manually allocated on (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 108) + ') by (' + [ALLOCATION].ModifiedBy + '). Invoice status was set to (paid).'
		WHEN ([ALLOCATION].Amount < [INVOICE].TotalInvoiceAmount) AND [ALLOCATION].ModifiedBy != 'BackendProcess' THEN '(R' + CONVERT(VARCHAR, [ALLOCATION].Amount) + ') was manually allocated on (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 108) + ') by (' + [ALLOCATION].ModifiedBy + '). Invoice status was set to (parcially paid).'
	END AS Audit_Text

FROM billing.Invoice [INVOICE]
FULL OUTER JOIN billing.InvoiceAllocation [ALLOCATION] ON [INVOICE].InvoiceId = [ALLOCATION].InvoiceId
WHERE [INVOICE].InvoiceNumber = 'INV:000782'

SELECT * FROM #Temp_Audit [TEMP]
WHERE [TEMP].Audit_Text IS NOT NULL

DROP TABLE #Temp_Audit
END  
