-- =================================================================
-- Author: Ryan Maree
-- Culprits: Sibahle Senda
-- Created date: 2020/08/14
-- =================================================================
CREATE PROCEDURE [billing].[InterbankTransferAudit]
	@RMABankAccountNumber AS VARCHAR(50)
AS 
BEGIN  


SELECT
CASE
	WHEN [STATUS].Name = 'Allocated' THEN [TRANSFER].CreatedBy + ' transferred (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') from (' + [ACCOUNTFROM].AccountNumber + ') to (' + [ACCOUNTTO].AccountNumber + ') on (' + CONVERT(VARCHAR(10), [TRANSFER].CreatedDate, 107) + ') with bank reference (' + (SELECT CONCAT(BANKSTATEMENTENTRY.StatementNumber, '/', BANKSTATEMENTENTRY.StatementLineNumber, ' ', (SELECT FORMAT (BANKSTATEMENTENTRY.StatementDate, 'dd/MM/yyyy')))) + ') at (' + CONVERT(VARCHAR(10), [TRANSFER].CreatedDate, 108) + ')' 
	WHEN [STATUS].Name = 'InProgress' THEN [TRANSFER].CreatedBy + ' is transferring (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') from (' + [ACCOUNTFROM].AccountNumber + ') to (' + [ACCOUNTTO].AccountNumber + ') on (' + CONVERT(VARCHAR(10), [TRANSFER].CreatedDate, 107) + ')  with bank reference (' + (SELECT CONCAT(BANKSTATEMENTENTRY.StatementNumber, '/', BANKSTATEMENTENTRY.StatementLineNumber, ' ', (SELECT FORMAT (BANKSTATEMENTENTRY.StatementDate, 'dd/MM/yyyy')))) + ') at (' + CONVERT(VARCHAR(10), [TRANSFER].CreatedDate, 108) + ')' 
	WHEN [STATUS].Name = 'Reversed' THEN [TRANSFER].CreatedBy + ' reversed (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') from (' + [ACCOUNTFROM].AccountNumber + ') to (' + [ACCOUNTTO].AccountNumber + ') on (' + CONVERT(VARCHAR(10), [TRANSFER].CreatedDate, 107) + ')  with bank reference (' + (SELECT CONCAT(BANKSTATEMENTENTRY.StatementNumber, '/', BANKSTATEMENTENTRY.StatementLineNumber, ' ', (SELECT FORMAT (BANKSTATEMENTENTRY.StatementDate, 'dd/MM/yyyy')))) + ') at (' + CONVERT(VARCHAR(10), [TRANSFER].CreatedDate, 108) + ')' 
	WHEN [STATUS].Name = 'Unallocated' THEN [TRANSFER].CreatedBy + ' is transferring (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') from (' + [ACCOUNTFROM].AccountNumber + ') to (' + [ACCOUNTTO].AccountNumber + ') on (' + CONVERT(VARCHAR(10), [TRANSFER].CreatedDate, 107) + ')  with bank reference (' + (SELECT CONCAT(BANKSTATEMENTENTRY.StatementNumber, '/', BANKSTATEMENTENTRY.StatementLineNumber, ' ', (SELECT FORMAT (BANKSTATEMENTENTRY.StatementDate, 'dd/MM/yyyy')))) + ') at (' + CONVERT(VARCHAR(10), [TRANSFER].CreatedDate, 108) + ')' 
	ELSE 'NO STORY HAS BEEN ADDED FOR STATUS: ' + [STATUS].Name
END AS [Interbank Transfer Audit]
FROM [billing].[InterBankTransfer] [TRANSFER]
INNER JOIN [common].[AllocationProgressStatus] [STATUS] ON [STATUS].Id = [TRANSFER].AllocationProgressStatusId
INNER JOIN [billing].[UnallocatedPayment] [TRANSACTIONSFROM] ON [TRANSACTIONSFROM].UnallocatedPaymentId = [TRANSFER].FromTransactionId
INNER JOIN [finance].[BankStatementEntry] [BANKSTATEMENTENTRY] ON [BANKSTATEMENTENTRY].BankStatementEntryId = [TRANSACTIONSFROM].BankStatementEntryId
LEFT JOIN [billing].[Transactions] [TRANSACTIONSTO] ON [TRANSACTIONSTO].TransactionId = [TRANSFER].FromTransactionId
LEFT JOIN [billing].[RmaBankAccounts] [ACCOUNTFROM] ON [ACCOUNTFROM].RmaBankAccountId = [TRANSFER].FromRmaBankAccountId
LEFT JOIN [billing].[RmaBankAccounts] [ACCOUNTTO] ON [ACCOUNTTO].RmaBankAccountId = [TRANSFER].ToRmaBankAccountId
WHERE [ACCOUNTTO].AccountNumber = @RMABankAccountNumber OR [ACCOUNTFROM].AccountNumber = @RMABankAccountNumber

END
