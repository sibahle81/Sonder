/* =============================================
Name:			GetDebtorProductBalances
Description:	Get balance for debtors products
Author:			Bongani Makelane
Create Date:	2023-06-27
Change Date:	
Culprits:		
============================================= */
CREATE PROCEDURE [billing].[GetDebtorProductBalances] --2616743  
@roleplayerId int
AS
BEGIN

declare @results table (ProductOptionName varchar(1000),ProductOptionId int,Balance decimal(18,2),PolicyId int, invoiceid int)
declare  @interestTransactions table (transactionid int, balance decimal(18,2))
declare  @creditFloatingTransactions table (transactionid int, balance decimal(18,2))
declare  @creditTransactionsAllocated table (transactionid int, balance decimal(18,2))
declare  @debitFloatingTransactions table (transactionid int, balance decimal(18,2))
--1	Debit
--2	Credit
insert into @results
SELECT 
 distinct Productoption.Code ProductOptionName,
[PRODUCTOPTION].Id AS ProductOptionId,
((t.amount*(-1)) +(isnull(positiveAllocations.amount,0)) - (isnull(reversedAllocations.amount,0))) * (-1),  
Invoice.PolicyId,invoice.invoiceid
FROM [client].Finpayee [DEBTOR]
INNER JOIN [policy].[Policy] [POLICY] ON [POLICY].PolicyPayeeId = [DEBTOR].RoleplayerId and [POLICY].parentpolicyid is null
INNER JOIN billing.Invoice [INVOICE] ON [INVOICE].PolicyId = [POLICY].PolicyId
inner join [billing].[Transactions] t on t.invoiceid = invoice.Invoiceid and t.TransactionTypeId =6
outer apply (select sum(amount) amount  from billing.invoiceallocation ia2 where ia2.InvoiceId = t.invoiceid and (ia2.transactiontypelinkid is null or ia2.transactiontypelinkid in (2)))
positiveAllocations
outer apply (select sum(amount) amount  from billing.invoiceallocation ia2 where ia2.InvoiceId = t.invoiceid and ia2.transactiontypelinkid =1)
reversedAllocations
left JOIN product.ProductOption [PRODUCTOPTION] ON [PRODUCTOPTION].Id = [POLICY].PRODUCTOPTIONID 
left JOIN product.ProductOptionBillingIntegration [CONFIG] ON [CONFIG].ProductOptionId = [PRODUCTOPTION].Id
left join common.Industry ind  on ind.id = [DEBTOR].IndustryId
left join common.IndustryClass ic   on ind.IndustryClassId= ic.Id 
where [DEBTOR].roleplayerId=@roleplayerId 
---select * from @results

declare @coidProductOptionId  int = (select top 1 ProductOptionId from @results where ProductOptionName ='emp')
declare @coidPolicyId  int = (select top 1 policyid from @results where ProductOptionName ='emp')

------interest
insert into @interestTransactions 
--select distinct t.transactionid, t.amount  as balance from billing.transactions t
select  t.transactionid, (t.amount  -(isnull(reversals.amount,0)))   as balance from billing.transactions t
outer apply (select transactionid, amount  from billing.transactions where linkedTransactionid = transactionid and transactiontypeid =17)
reversals
where roleplayerid=@roleplayerId 
and t.transactiontypeid = 7
and t.transactionid not in (select transactionid from billing.invoiceallocation)
and isdeleted <>1
--put all floating transactions under emp
declare @interestTotalAmount decimal(18,2) =(select sum(balance) from  @interestTransactions)

------floating credits
insert into @creditFloatingTransactions 
select  t.transactionid, t.amount  -(isnull(reversals.amount,0)) as balance from billing.transactions t
outer apply (select transactionid, amount  from billing.transactions t1 where t1.linkedTransactionid = t.transactionid and t1.transactiontypeLinkid =1) reversals
where roleplayerid=@roleplayerId 
and t.transactiontypeLinkid  =2
and t.transactionid not in (select transactionid from billing.invoiceallocation)
and isdeleted <>1

---select * from @creditFloatingTransactions

------allocated credits
insert into @creditTransactionsAllocated 
select  t.transactionid, t.amount  -(isnull(allocations.amount,0)) as balance from billing.transactions t
outer apply (select sum(amount) amount  from billing.invoiceallocation ia2 where ia2.TransactionId = t.TransactionId and (ia2.transactiontypelinkid is null or ia2.transactiontypelinkid in (2)))
allocations
where roleplayerid=@roleplayerId 
and t.transactiontypeLinkid  =2
and t.transactionid  in (select transactionid from billing.invoiceallocation)
and isdeleted <>1
---select * from @creditTransactionsAllocated

--------floating debits
insert into @debitFloatingTransactions 
select  t.transactionid,[dbo].[GetTransactionBalance](t.transactionid)as balance from billing.transactions t
--outer apply (select transactionid, amount  from billing.transactions t1 where t1.linkedTransactionid = t.transactionid and t1.transactiontypeLinkid =1) reversals
where roleplayerid=@roleplayerId 
and t.transactiontypeLinkid  =1
and ( t.transactionid not  in (select transactionid from billing.invoiceallocation)
or t.transactionid not  in (select linkedtransactionid from billing.invoiceallocation))
AND TRANSACTIONTYPEID NOT IN (6,7)
and isdeleted <>1

declare @creditFloatingTransactionsAmount decimal(18,2) =(select sum(balance) * (-1)  from  @creditFloatingTransactions)
declare @creditAllocatedTransactionsAmount decimal(18,2) =(select sum(balance) * (-1)   from  @creditTransactionsAllocated)
declare @debitFloatingTransactionsAmount decimal(18,2) =(select sum(balance)   from  @debitFloatingTransactions)

insert into @results values('interest',@coidProductOptionId, (isnull(@interestTotalAmount,0)) , @coidPolicyId,0)
insert into @results values('emp',@coidProductOptionId,(isnull(@creditFloatingTransactionsAmount,0)) , @coidPolicyId,0)
insert into @results values('emp',@coidProductOptionId,(isnull(@creditAllocatedTransactionsAmount,0)) , @coidPolicyId,0)
insert into @results values('emp',@coidProductOptionId,(isnull(@debitFloatingTransactionsAmount,0)) , @coidPolicyId,0)
select * from @results
END