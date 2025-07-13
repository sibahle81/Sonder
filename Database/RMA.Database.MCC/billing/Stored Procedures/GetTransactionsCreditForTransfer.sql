
-- =============================================
-- Author:		Bongani Makelane
-- Create date: 20/12/2023
-- =============================================
CREATE       PROCEDURE [billing].[GetTransactionsCreditForTransfer] --null, '10 jan 2024', 2616743,'62512854169'
 @startDate date =NULL,
 @endDate date,
 @roleplayerId int,
 @bankaccount varchar(200)
AS
BEGIN

if @startDate is null
begin
set @startDate = (select top 1 createddate from billing.Transactions where roleplayerid= @roleplayerId)
end

select distinct cf.FinPayeNumber, t.CreatedDate,t.TransactionEffectiveDate,t.Amount,t.BankReference,cb.AccountNumber, t.TransactionId, t.RmaReference,t.RolePlayerId,t.LinkedTransactionId,t.TransactionTypeLinkId,t.TransactionTypeId TransactionType, 
ISNULL( debits.balance, t.Amount) Balance, ISNULL( debits.balance, t.Amount) UnallocatedAmount
from client.finpayee cf
join billing.Transactions t on t.RolePlayerId = cf.RolePlayerId
left join policy.policy pp on pp.policypayeeid = cf.roleplayerid and pp.parentpolicyid is null
left join product.productOption po on po.id = pp.productoptionid
left join common.industry ci on ci.id =cf.industryid
left join product.productbankaccount pba on pba.industryclassid = ci.industryclassid and pba.productid = po.productid
left join common.bankaccount cb on cb.id = pba.bankaccountid
 outer apply (select (t.amount) - sum(t2.amount)  balance from billing.transactions t2 where linkedtransactionid = t.transactionid and transactiontypelinkid = 1) debits
 WHERE t.isdeleted <> 1 and
 ( cf.roleplayerId = @roleplayerId
	and t.TransactionTypeLinkId = 2 and t.TransactionTypeId in (3,4)
	and cb.AccountNumber =@bankaccount )
	or 
	(cf.roleplayerId = @roleplayerId
	and t.TransactionTypeLinkId = 2
	and t.TransactionTypeId in (9)--interdebtor transfer
	and  t.BankReference = @bankaccount 
	) and t.TransactionDate between @startDate and @endDate
	END