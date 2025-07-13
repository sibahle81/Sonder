CREATE PROCEDURE [billing].[UpdateIndividualPolicyInvoiceAmounts]
as begin
update i
set i.totalinvoiceamount = p.InstallmentPremium
from billing.Invoice i, policy.Policy p
where p.policyid = i.PolicyId and i.InvoiceDate >= '2020-11-01' and p.ParentPolicyId is null

update t
set t.Amount = p.InstallmentPremium
from billing.Invoice i, billing.Transactions t, policy.Policy p
where p.policyid = i.PolicyId and i.InvoiceDate >= '2020-11-01' and t.InvoiceId = i.InvoiceId
and t.TransactionTypeId = 6  and p.ParentPolicyId is null
end