-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/15
-- Culprits: Sibahle Senda
-- =================================================================
CREATE PROCEDURE [billing].[AdhocPaymentAudit]
	@FinPayeeNumber AS VARCHAR(50)
AS 
BEGIN  

SELECT 
CASE
	WHEN [STATUS].Name = 'Pending' AND [DEBITORDER].ErrorDescription IS NULL THEN 'An amount of (R' + CONVERT(VARCHAR, [DEBITORDER].Amount) + ') will be debited from (' + [DEBITORDER].RolePlayerName + '-' + [ACCOUNT].FinpayeNumber + '). This debit order is (pending). This debit order was triggered by (' + [DEBITORDER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [DEBITORDER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [DEBITORDER].ModifiedDate, 108) + ')' 
	WHEN [STATUS].Name = 'Paid' AND [DEBITORDER].ErrorDescription IS NULL THEN 'An amount of (R' + CONVERT(VARCHAR, [DEBITORDER].Amount) + ') was debited from (' + [DEBITORDER].RolePlayerName + '-' + [ACCOUNT].FinpayeNumber + '). This debit order is (collected). This debit order was triggered by (' + [DEBITORDER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [DEBITORDER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [DEBITORDER].ModifiedDate, 108) + ')' 
	WHEN [STATUS].Name = 'UnPaid' AND [DEBITORDER].ErrorDescription IS NULL THEN 'An amount of (R' + CONVERT(VARCHAR, [DEBITORDER].Amount) + ') was to be debited from (' + [DEBITORDER].RolePlayerName + '-' + [ACCOUNT].FinpayeNumber + '). This debit order (failed). This debit order was triggered by (' + [DEBITORDER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [DEBITORDER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [DEBITORDER].ModifiedDate, 108) + ')' 
	WHEN [DEBITORDER].ErrorDescription IS NOT NULL THEN 'An amount of (R' + CONVERT(VARCHAR, [DEBITORDER].Amount) + ') was to be debited from (' + [DEBITORDER].RolePlayerName + '-' + [ACCOUNT].FinpayeNumber + '). This debit order (failed) because ' + [DEBITORDER].ErrorDescription + '. This debit order was triggered by (' + [DEBITORDER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [DEBITORDER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [DEBITORDER].ModifiedDate, 108) + ')' 
END AS [Adhoc Payment Audit]
FROM [billing].[AdhocPaymentInstructions] [DEBITORDER] 
INNER JOIN [client].[FinPayee] [ACCOUNT] ON [ACCOUNT].RolePlayerId = [DEBITORDER].RolePlayerId
INNER JOIN [common].[AdhocPaymentInstructionStatus] [STATUS] ON [STATUS].Id = [DEBITORDER].AdhocPaymentInstructionStatusId
WHERE [ACCOUNT].FinPayeNumber = @FinPayeeNumber

END  
