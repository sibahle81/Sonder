-- =============================================
-- Author:		Bongani
-- Create date: 03 Aug 2023
-- Description:	CheckDebtorCreditBalanceIsGreaterThanDebitDocuments
-- =============================================
CREATE PROCEDURE billing.DebtorCreditBalanceIsGreaterThanDebit
@roleplayerId int
AS
BEGIN
declare @creditBalance decimal(18,2) =	(select sum(dbo.GetTransactionBalance(t.TransactionId)) from billing.Transactions t where RolePlayerId = @roleplayerId and TransactionTypeLinkId =2)
declare @interestTransactionBalance decimal(18,2) =	(select sum(dbo.GetTransactionBalanceForInterest(t.TransactionId)) from billing.Transactions t where RolePlayerId = @roleplayerId and transactiontypeId in (7))
declare @debitTransactionBalance decimal(18,2) = (select sum(dbo.GetTransactionBalance(t.TransactionId)) from billing.Transactions t where RolePlayerId = @roleplayerId and transactiontypeId not in (7) and  TransactionTypeLinkId =1)

if (select   @creditBalance + (@debitTransactionBalance + @interestTransactionBalance)) < 0
	begin
	select cast( 1 as bit)
	end
	else
	begin
		select cast( 0 as bit)
	end
END