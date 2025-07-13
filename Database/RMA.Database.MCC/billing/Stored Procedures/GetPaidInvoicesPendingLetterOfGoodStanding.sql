CREATE   PROCEDURE [billing].[GetPaidInvoicesPendingLetterOfGoodStanding]
AS
BEGIN
	 select top 100 i.*, InvoiceStatus= 1   from billing.InvoiceAllocation ia
  inner join billing.invoice i on ia.invoiceid= i.invoiceid
  inner join billing.Transactions t on t.invoiceid = i.invoiceid and t.transactiontypeid =6
  inner join policy.policy p on i.PolicyId = p.PolicyId
inner join product.ProductOption po on po.id = p.productOptionId
inner join product.product pp on pp.id = po.productid
  inner join client.FinPayee cf on p.PolicyPayeeId = cf.RolePlayerId
  outer apply (select top 1 createddate from billing.InvoiceAllocation ia order by 1 desc) lastAllocation
  where cf.roleplayerid not in (select roleplayerid from [client].[LetterOfGoodStanding] where issuedate < lastAllocation.CreatedDate)
and pp.code like '%coid%' and pp.UnderwriterId =1
 and i.InvoiceStatusId= 1 
END