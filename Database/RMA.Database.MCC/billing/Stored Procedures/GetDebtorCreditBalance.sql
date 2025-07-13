-- =============================================
-- Author:		Bongani
-- Create date: 03 Aug 2023
-- Description:	GetDebtorCreditBalance
-- =============================================
create PROCEDURE [billing].[GetDebtorCreditBalance] --718018
@roleplayerId int
AS
BEGIN
declare @creditBalance decimal(18,2) =	(select sum(dbo.GetTransactionBalance(t.TransactionId)) from billing.Transactions t where RolePlayerId = @roleplayerId and TransactionTypeLinkId =2)
declare @debitTransactionBalance decimal(18,2) = (select sum(dbo.GetTransactionBalance(t.TransactionId)) from billing.Transactions t where RolePlayerId = @roleplayerId  and  TransactionTypeLinkId =1)
--negative value for @creditBalance means we have money
select   @creditBalance + (@debitTransactionBalance)	
END