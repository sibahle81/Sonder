-- =============================================
-- Author:		Bongani
-- Create date: 17 Jan 2023
-- Description:	[GetDebtorCreditBalanceForClosedPeriods]
-- =============================================
Create PROCEDURE [billing].[GetDebtorCreditBalanceForClosedPeriods] --1009564
@roleplayerId int,
@currentPeriodStart date
AS
BEGIN
set @currentPeriodStart = (select startdate from [common].[Period] where [status]='current')

declare @creditBalance decimal(18,2) =	(select sum(dbo.GetTransactionBalance(t.TransactionId)) from billing.Transactions t where RolePlayerId = @roleplayerId and TransactionTypeLinkId =2 and t.transactiondate < @currentPeriodStart)
declare @debitTransactionBalance decimal(18,2) = (select sum(dbo.GetTransactionBalance(t.TransactionId)) from billing.Transactions t where RolePlayerId = @roleplayerId  and  TransactionTypeLinkId =1 and t.transactiondate < @currentPeriodStart)
--negative value for @creditBalance means we have money
select   @creditBalance + (@debitTransactionBalance)	
END