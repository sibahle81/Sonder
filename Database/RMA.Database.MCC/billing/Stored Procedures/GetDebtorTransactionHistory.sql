-- =============================================
-- Author:		Bongani
-- Create date: 17 Jan 2023
-- Description:	[GetDebtorTransactionHistory]
-- =============================================
CREATE PROCEDURE [billing].[GetDebtorTransactionHistory] --1009564
@roleplayerId int,
 @startDate date = NULL,
 @endDate date = NULL
AS
BEGIN

if @endDate is NUll 
begin
set @endDate  =(select getdate())
end

if @startDate is NUll or @startDate ='1 Jan 1900'
begin
set @startDate = (select min(transactiondate) from billing.transactions where roleplayerId = @roleplayerId)
end

select pp.policynumber, Isnull(pp.policyid, 0) policyid,tp.name transactiontype,t.transactiontypeId,
CASE WHEN t.transactiontypeid in ( 4,3,1,9,7,17) THEN t.RmaReference 		
when t.transactiontypeid= 6 THEN inv.invoicenumber END AS documentNumber,
CASE WHEN tpl.IsDebit = 1 THEN t.Amount ELSE 0 END AS DebitAmount, 
CASE WHEN tpl.IsDebit = 0 THEN t.Amount ELSE 0 END AS CreditAmount,
dbo.gettransactionbalance(t.transactionid) as Balance, t.CreatedDate, t.TransactionTypeLinkId
from billing.transactions t 
join common.transactiontype tp on t.transactiontypeid = tp.id
join billing.TransactionTypeLink tpl on tpl.id = t.TransactionTypeLinkid
left join billing.invoice inv on t.invoiceid = inv.invoiceid and t.transactiontypeid=6
left join policy.policy pp on pp.policyid = inv.policyid

where t.roleplayerid =@roleplayerId
and t.transactiondate between @startDate and @endDate
END