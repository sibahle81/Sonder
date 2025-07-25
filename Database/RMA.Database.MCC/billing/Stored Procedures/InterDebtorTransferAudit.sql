-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/15
-- =================================================================
CREATE PROCEDURE [billing].[InterDebtorTransferAudit]
	@FinPayeeNumber AS VARCHAR(50)
AS 
BEGIN  

SELECT 
CASE
	WHEN [STATUS].Name = 'InProgress' THEN 'An amount of (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') will be transferred from debtor account (' + [TRANSFER].FromDebtorNumber + ') into debtor account (' + [TRANSFER].ReceiverDebtorNumber + '). This transfer is (in progress).This transfer was triggered by (' + [TRANSFER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 108) + ')' 
	WHEN [STATUS].Name = 'UnAllocated' THEN 'An amount of (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') will be transferred from debtor account (' + [TRANSFER].FromDebtorNumber + ') into debtor account (' + [TRANSFER].ReceiverDebtorNumber + '). This transfer has been (de-allocated). This transfer was triggered by (' + [TRANSFER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 108) + ')'
	WHEN [STATUS].Name = 'Allocated' THEN 'An amount of (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') was transferred from debtor account (' + [TRANSFER].FromDebtorNumber + ') into debtor account (' + [TRANSFER].ReceiverDebtorNumber + '). This transfer has been (allocated). This transfer was triggered by (' + [TRANSFER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 108) + ')'
END AS [Inter Debtor Transfer Audit]
FROM billing.InterDebtorTransfer [TRANSFER]
INNER JOIN common.AllocationProgressStatus [STATUS] ON [STATUS].Id = [TRANSFER].AllocationProgressStatusId
WHERE [TRANSFER].FromDebtorNumber = @FinPayeeNumber OR [TRANSFER].ReceiverDebtorNumber = @FinPayeeNumber
END  
