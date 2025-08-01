-- =================================================================
-- Author: Ryan Maree
-- Culprits: Sibahle Senda
-- Created date: 2020/08/14
-- =================================================================
CREATE PROCEDURE [billing].[InterbankTransferAuditStandard]
	@RMABankAccountNumber AS VARCHAR(50)
AS 
BEGIN  


SELECT
[ACCOUNTFROM].AccountNumber AS [From Account],
[ACCOUNTTO].AccountNumber AS [To Account],
[TRANSFER].OriginalAmount AS [Original Amount],
[TRANSFER].TransferAmount AS [Amount Transferred],
(SELECT CONCAT(BANKSTATEMENTENTRY.StatementNumber, '/', BANKSTATEMENTENTRY.StatementLineNumber, ' ', (SELECT FORMAT (BANKSTATEMENTENTRY.StatementDate, 'dd/MM/yyyy')))) AS [Bank Reference],
[STATUS].Name AS [Status],
[TRANSFER].CreatedBy AS [Created By],
[TRANSFER].CreatedDate AS [Created Date]

FROM [billing].[InterBankTransfer] [TRANSFER]
INNER JOIN [common].[AllocationProgressStatus] [STATUS] ON [STATUS].Id = [TRANSFER].AllocationProgressStatusId
INNER JOIN [billing].[UnallocatedPayment] [TRANSACTIONSFROM] ON [TRANSACTIONSFROM].UnallocatedPaymentId = [TRANSFER].FromTransactionId
INNER JOIN [finance].[BankStatementEntry] [BANKSTATEMENTENTRY] ON [BANKSTATEMENTENTRY].BankStatementEntryId = [TRANSACTIONSFROM].BankStatementEntryId
LEFT JOIN [billing].[Transactions] [TRANSACTIONSTO] ON [TRANSACTIONSTO].TransactionId = [TRANSFER].FromTransactionId
LEFT JOIN [billing].[RmaBankAccounts] [ACCOUNTFROM] ON [ACCOUNTFROM].RmaBankAccountId = [TRANSFER].FromRmaBankAccountId
LEFT JOIN [billing].[RmaBankAccounts] [ACCOUNTTO] ON [ACCOUNTTO].RmaBankAccountId = [TRANSFER].ToRmaBankAccountId
WHERE [ACCOUNTTO].AccountNumber = @RMABankAccountNumber OR [ACCOUNTFROM].AccountNumber = @RMABankAccountNumber

END  
