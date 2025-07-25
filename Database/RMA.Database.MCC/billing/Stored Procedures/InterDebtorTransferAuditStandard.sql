-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/15
-- =================================================================
CREATE PROCEDURE [billing].[InterDebtorTransferAuditStandard]
	@FinPayeeNumber AS VARCHAR(50)
AS 
BEGIN  

SELECT 
	[TRANSFER].FromDebtorNumber AS [From Debtor],
	[TRANSFER].ReceiverDebtorNumber AS [To Debtor],
	[TRANSFER].TransferAmount AS [Amount],
	[TRANSFER].ReceiverAccountNumber AS [Receiver Bank Account],
	[STATUS].Name AS [Status],
	[TRANSFER].ModifiedBy AS [Modified By],
	CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 107) + ' ' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 108) AS [Modified Date]
FROM billing.InterDebtorTransfer [TRANSFER]
INNER JOIN common.AllocationProgressStatus [STATUS] ON [STATUS].Id = [TRANSFER].AllocationProgressStatusId
WHERE [TRANSFER].FromDebtorNumber = @FinPayeeNumber OR [TRANSFER].ReceiverDebtorNumber = @FinPayeeNumber

END  


