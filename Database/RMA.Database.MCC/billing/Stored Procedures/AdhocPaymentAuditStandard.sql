-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/15
-- =================================================================
CREATE PROCEDURE [billing].[AdhocPaymentAuditStandard]
	@FinPayeeNumber AS VARCHAR(50)
AS 
BEGIN  

SELECT 
[PAYMENT].Amount,
[ACCOUNT].FinpayeNumber,
[PAYMENT].RolePlayerName,
[PAYMENT].DateToPay,
[STATUS].Name,
[PAYMENT].ErrorDescription,
[PAYMENT].ModifiedBy,
[PAYMENT].ModifiedDate
FROM [billing].[AdhocPaymentInstructions] [PAYMENT] 
INNER JOIN [client].[FinPayee] [ACCOUNT] ON [ACCOUNT].RolePlayerId = [PAYMENT].RolePlayerId
INNER JOIN [common].[AdhocPaymentInstructionStatus] [STATUS] ON [STATUS].Id = [PAYMENT].AdhocPaymentInstructionStatusId
WHERE [ACCOUNT].FinPayeNumber = @FinPayeeNumber

END  
