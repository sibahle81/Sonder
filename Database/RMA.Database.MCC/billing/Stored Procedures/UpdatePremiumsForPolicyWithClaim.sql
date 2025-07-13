CREATE PROCEDURE [billing].[UpdatePremiumsForPolicyWithClaim]
@policyId int
AS BEGIN
-- Get policy
DECLARE @PoliciesWithClaims table(PolicyId int, PolicyOwnerId int, Premium decimal(18,2), InvoiceId int, InvoiceAmount decimal(18,2));
DECLARE @Today DATE = (SELECT GETDATE())
DECLARE @NextPeriodStartDate DATE = DATEFROMPARTS(DATEPART(year, @Today), ((DATEPART(MONTH, @Today)) + 1), 1)
insert into @PoliciesWithClaims
select p.PolicyId, p.PolicyOwnerId, p.InstallmentPremium, i.InvoiceId, i.TotalInvoiceAmount
from policy.PolicyInsuredLives pil,
policy.Policy p, client.Person pn,
claim.Claim c, claim.PersonEvent pe,
payment.Payment pa, billing.Invoice i
where p.PolicyId = @policyId
and p.PolicyId = c.PolicyId
and p.ParentPolicyId is null
and pil.PolicyId = p.PolicyId
and c.PersonEventId = pe.PersonEventId
and pn.RolePlayerId = pe.InsuredLifeId
and pil.RolePlayerId = pn.RolePlayerId
and pa.ClaimId = c.ClaimId
and c.ClaimStatusId in (9,14)
and i.InvoiceDate = @NextPeriodStartDate
and i.PolicyId = p.PolicyId
and i.InvoiceDate > pn.DateOfDeath
and i.InvoiceId = (select max(i2.InvoiceId) from billing.Invoice i2 where i2.PolicyId = i.PolicyId
                   and i2.InvoiceDate = i.InvoiceDate)

insert into @PoliciesWithClaims
select parent.PolicyId, parent.PolicyOwnerId, parent.InstallmentPremium, i.InvoiceId, i.TotalInvoiceAmount
from policy.PolicyInsuredLives pil,
policy.Policy p, policy.Policy parent, client.Person pn,
claim.Claim c, claim.PersonEvent pe,
payment.Payment pa, billing.Invoice i
where p.PolicyId = @policyId
and p.PolicyId = c.PolicyId
and p.ParentPolicyId is not null
and parent.PolicyId = p.ParentPolicyId
and pil.PolicyId = p.PolicyId
and c.PersonEventId = pe.PersonEventId
and pn.RolePlayerId = pe.InsuredLifeId
and pil.RolePlayerId = pn.RolePlayerId
and pa.ClaimId = c.ClaimId
and c.ClaimStatusId in (9,14)
and i.InvoiceDate = @NextPeriodStartDate
and i.PolicyId = parent.PolicyId
and i.InvoiceDate > pn.DateOfDeath
and i.InvoiceId = (select max(i2.InvoiceId) from billing.Invoice i2 where i2.PolicyId = i.PolicyId
                   and i2.InvoiceDate = i.InvoiceDate)
--select * from @PoliciesWithClaims

begin tran trxUpdatePremiums
-- Update premiums
   update p set InstallmentPremium = InvoiceAmount
   from @PoliciesWithClaims pc, policy.Policy p
   where p.PolicyId = pc.PolicyId
commit tran trxUpdatePremiums
END