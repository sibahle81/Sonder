CREATE PROCEDURE [billing].[UpdateGroupInvoiceAmounts]
as begin
declare @Policies table (PolicyId int, InvoiceDate date,InstallmentPremium money, TotalPremium money, PremiumPerInsuredLife money, InsuredLifeCount int, InsuredLifePremiumApplicableCount int)
insert @Policies(PolicyId, InvoiceDate, InstallmentPremium)
select i.PolicyId, I.InvoiceDate, p.InstallmentPremium from billing.Invoice i, policy.Policy p where p.PolicyId = i.PolicyId and i.InvoiceDate >= '2020-11-01'
and (EXISTS (SELECT c.RolePlayerId from [client].[Company] c where c.RolePlayerId = p.PolicyOwnerId))

  update p set p.InsuredLifeCount = (SELECT count(pil.PolicyId) FROM [policy].[PolicyInsuredLives] pil
  where pil.PolicyId = p2.PolicyId
  and pil.RolePlayerTypeId in (10) -- main member
  and (pil.EndDate >  p.InvoiceDate or pil.EndDate is null) 
  and pil.StartDate <= p.InvoiceDate) 
  from @Policies p, [policy].[Policy] p2 where p2.ParentPolicyId = p.PolicyId

  update p set p.InsuredLifePremiumApplicableCount = (SELECT count(pil.PolicyId) FROM [policy].[PolicyInsuredLives] pil
  where pil.PolicyId = p2.PolicyId
  and pil.RolePlayerTypeId in (10) -- main member
  and (pil.EndDate >  p.InvoiceDate or pil.EndDate is null) 
  and pil.StartDate <= p.InvoiceDate) 
  from @Policies p, [policy].[Policy] p2
  where p2.ParentPolicyId = p.PolicyId

  delete from @Policies where InsuredLifeCount = 0

 -- calculate premiums per insured lifes
  update p set p.PremiumPerInsuredLife = p.InstallmentPremium / p.InsuredLifeCount from #Policies p where p.InsuredLifeCount > 0

 --calculate total premiums
 update p set p.TotalPremium = p.PremiumPerInsuredLife * p.InsuredLifePremiumApplicableCount from @Policies p

 update i
set i.totalinvoiceamount = p.InstallmentPremium
from billing.Invoice i, @Policies p
where p.policyid = i.PolicyId and i.InvoiceDate = p.InvoiceDate

update t
set t.Amount = i.TotalInvoiceAmount
from billing.Invoice i, billing.Transactions t, @Policies p
where p.policyid = i.PolicyId and t.InvoiceId = i.InvoiceId
and t.TransactionTypeId = 6 and i.InvoiceDate >= '2020-11-01'
end