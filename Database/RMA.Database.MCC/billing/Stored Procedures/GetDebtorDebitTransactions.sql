-- =============================================
-- Author:		bongani makelane
-- Create date: 12-07-2022
-- Description:	Gets balances for interest, invoice and other debit transaction
-- =============================================
CREATE PROCEDURE [billing].[GetDebtorDebitTransactions]
	@roleplayerId int
AS
BEGIN
	select  dbo.GetTransactionBalance(t.TransactionId),t.* from billing.Transactions t
where roleplayerid =@roleplayerId and transactiontypeid in(6,7) and t.IsDeleted =0
and dbo.GetTransactionBalance(t.TransactionId) > 0
END