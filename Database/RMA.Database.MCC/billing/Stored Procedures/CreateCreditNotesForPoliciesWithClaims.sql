CREATE PROCEDURE [billing].[CreateCreditNotesForPoliciesWithClaims]
@startDate date,
@endDate date
AS BEGIN
-- Get contributions for deceased members for each invoice paid
DECLARE @DeceasedMemberPremiumContributions table(InsuredLifeId int, PolicyId int, PolicyOwnerId int,
InvoiceId int, InvoiceNumber varchar(50), InvoiceDate date, PremiumContribution decimal(18,2));
insert into @DeceasedMemberPremiumContributions
select pil.RolePlayerId, pil.PolicyId, p.PolicyOwnerId, i.InvoiceId, i.InvoiceNumber, i.InvoiceDate,
policy.GetMemberPremiumContribution(pil.PolicyId, pil.RolePlayerId, i.InvoiceDate)
from policy.PolicyInsuredLives pil,
policy.Policy p, client.Person pn,
claim.Claim c, claim.PersonEvent pe,
payment.Payment pa, billing.Invoice i
where p.PolicyId = c.PolicyId
and p.ParentPolicyId is null
and pil.PolicyId = p.PolicyId
and c.PersonEventId = pe.PersonEventId
and pn.RolePlayerId = pe.InsuredLifeId
and pil.RolePlayerId = pn.RolePlayerId
and pa.ClaimId = c.ClaimId
and c.ClaimStatusId in (9,14)
and i.InvoiceDate >= '2020-11-01'
and i.InvoiceDate >= @startDate
and i.InvoiceDate <= @endDate
and i.PolicyId = p.PolicyId
and i.InvoiceDate > pn.DateOfDeath
and (not exists(select i2.InvoiceId from billing.Invoice i2, billing.Transactions t, billing.InvoiceAllocation ia
where i2.PolicyId = i.PolicyId and i2.InvoiceDate = i.InvoiceDate
and ia.InvoiceId = i2.InvoiceId and i2.InvoiceId = i.InvoiceId and t.TransactionId = ia.TransactionId
and t.TransactionTypeId = 4))
and (not exists(select t.TransactionId from billing.Transactions t
where t.RolePlayerId = p.PolicyOwnerId and (t.TransactionDate >= dateadd(DD, 1, i.InvoiceDate))
AND t.TransactionDate <= dateadd(DD, 1, EOMONTH(i.InvoiceDate))
and t.TransactionTypeId = 4 and CHARINDEX('Refund', t.RmaReference) > 0))
and (exists(select t.TransactionId from billing.Transactions t
where t.RolePlayerId = p.PolicyOwnerId and (t.CreatedDate >= dateadd(DD, 1, i.InvoiceDate))
AND t.CreatedDate <= dateadd(DD, 1, EOMONTH(i.InvoiceDate))
and t.TransactionTypeId = 3))
and ((select count(i2.InvoiceId) from billing.Invoice i2 where i2.PolicyId = i.PolicyId
and i2.InvoiceDate = i.InvoiceDate) = 1)

insert into @DeceasedMemberPremiumContributions
select pil.RolePlayerId, parent.PolicyId, parent.PolicyOwnerId, i.InvoiceId, i.InvoiceNumber, i.InvoiceDate,
policy.GetMemberPremiumContribution(pil.PolicyId, pil.RolePlayerId, i.InvoiceDate)
from policy.PolicyInsuredLives pil,
policy.Policy p, client.Person pn,
claim.Claim c, claim.PersonEvent pe,
payment.Payment pa, billing.Invoice i,
policy.Policy parent
where p.PolicyId = c.PolicyId
and p.ParentPolicyId is not null
and parent.PolicyId = p.ParentPolicyId
and pil.PolicyId = p.PolicyId
and c.PersonEventId = pe.PersonEventId
and pn.RolePlayerId = pe.InsuredLifeId
and pil.RolePlayerId = pn.RolePlayerId
and pa.ClaimId = c.ClaimId
and c.ClaimStatusId in (9,14)
and i.InvoiceDate >= '2020-11-01'
and i.InvoiceDate >= @startDate
and i.InvoiceDate <= @endDate
and i.PolicyId = parent.PolicyId
and i.InvoiceDate > pn.DateOfDeath
and (not exists(select i2.InvoiceId from billing.Invoice i2, billing.Transactions t, billing.InvoiceAllocation ia
where i2.PolicyId = i.PolicyId and i2.InvoiceDate = i.InvoiceDate
and ia.InvoiceId = i2.InvoiceId and i2.InvoiceId = i.InvoiceId and t.TransactionId = ia.TransactionId
and t.TransactionTypeId = 4))
and (not exists(select t.TransactionId from billing.Transactions t
where t.RolePlayerId = parent.PolicyOwnerId and (t.TransactionDate >= dateadd(DD, 1, i.InvoiceDate))
AND t.TransactionDate <= dateadd(DD, 1, EOMONTH(i.InvoiceDate))
and t.TransactionTypeId = 4 and CHARINDEX('Refund', t.RmaReference) > 0))
and (exists(select t.TransactionId from billing.Transactions t
where t.RolePlayerId = parent.PolicyOwnerId and (t.CreatedDate >= dateadd(DD, 1, i.InvoiceDate)
and t.Amount = i.TotalInvoiceAmount)
AND t.CreatedDate <= dateadd(DD, 1, EOMONTH(i.InvoiceDate))
and t.TransactionTypeId = 3))
and ((select count(i2.InvoiceId) from billing.Invoice i2 where i2.PolicyId = i.PolicyId
and i2.InvoiceDate = i.InvoiceDate) = 1)
--select * from @DeceasedMemberPremiumContributions
begin tran trxInsertCreditNotesForRefunds
-- Create notes for refunds
   insert into [billing].[Transactions] (RolePlayerId, BankStatementEntryId, TransactionTypeLinkId,
  Amount, TransactionDate, BankReference, TransactionTypeId, CreatedDate, ModifiedDate, CreatedBy, ModifiedBy, RmaReference)
  (select PolicyOwnerId, null, 2, PremiumContribution, EOMONTH(InvoiceDate), '',
   4, (select getdate()), (select getdate()), 'system@randmutual.co.za', 'system@randmutual.co.za',
   concat('Refund for ',InvoiceNumber) 
   from @DeceasedMemberPremiumContributions
   where PremiumContribution > 0)
commit tran trxInsertCreditNotesForRefunds

-- Get incorrect unpaid invoices
DECLARE @InvoicesToBeAdjusted table(InsuredLifeId int, PolicyId int, PolicyOwnerId int,
InvoiceId int, InvoiceNumber varchar(50), InvoiceDate date, CollectionDate date, PremiumContribution decimal(18,2), InvoiceAmount decimal(18,2));
insert into @InvoicesToBeAdjusted
select distinct pil.RolePlayerId, pil.PolicyId, p.PolicyOwnerId, i.InvoiceId, i.InvoiceNumber, i.InvoiceDate, i.CollectionDate,
policy.GetMemberPremiumContribution(pil.PolicyId, pil.RolePlayerId, i.InvoiceDate), i.TotalInvoiceAmount
from policy.PolicyInsuredLives pil,
policy.Policy p, client.Person pn,
claim.Claim c, claim.PersonEvent pe,
payment.Payment pa, billing.Invoice i
where p.PolicyId = c.PolicyId
and p.ParentPolicyId is null
and pil.PolicyId = p.PolicyId
and c.PersonEventId = pe.PersonEventId
and pn.RolePlayerId = pe.InsuredLifeId
and pil.RolePlayerId = pn.RolePlayerId
and pa.ClaimId = c.ClaimId
and c.ClaimStatusId in (9,14)
and i.InvoiceDate >= '2020-11-01'
and i.CreatedDate >= @startDate
and i.CreatedDate <= @endDate
and i.PolicyId = p.PolicyId
and i.InvoiceDate > pn.DateOfDeath
and (not exists(select i2.InvoiceId from billing.Invoice i2, billing.Transactions t, billing.InvoiceAllocation ia
where i2.PolicyId = i.PolicyId and i2.InvoiceDate = i.InvoiceDate
and ia.InvoiceId = i2.InvoiceId and i2.InvoiceId = i.InvoiceId and t.TransactionId = ia.TransactionId
and t.TransactionTypeId = 4))
and (not exists(select t.TransactionId from billing.Transactions t
where t.RolePlayerId = p.PolicyOwnerId and (t.TransactionDate >= dateadd(DD, 1, i.InvoiceDate))
AND t.TransactionDate <= dateadd(DD, 1, EOMONTH(i.InvoiceDate))
and t.TransactionTypeId = 4 and CHARINDEX('Refund', t.RmaReference) > 0))
and (not exists(select t.TransactionId from billing.Transactions t
where t.RolePlayerId = p.PolicyOwnerId and (t.CreatedDate >= dateadd(DD, 1, i.InvoiceDate))
AND t.CreatedDate <= dateadd(DD, 1, EOMONTH(i.InvoiceDate))
and t.TransactionTypeId = 3))
and ((select count(i2.InvoiceId) from billing.Invoice i2 where i2.PolicyId = i.PolicyId
and i2.InvoiceDate = i.InvoiceDate) = 1)
and exists(select roleplayerid from client.FinPayee f where f.roleplayerid = p.policyownerid)

insert into @InvoicesToBeAdjusted
select distinct pil.RolePlayerId, parent.PolicyId, parent.PolicyOwnerId, i.InvoiceId, i.InvoiceNumber, i.InvoiceDate, i.CollectionDate,
policy.GetMemberPremiumContribution(pil.PolicyId, pil.RolePlayerId, i.InvoiceDate), i.TotalInvoiceAmount
from policy.PolicyInsuredLives pil,
policy.Policy p, policy.Policy parent, client.Person pn,
claim.Claim c, claim.PersonEvent pe,
payment.Payment pa, billing.Invoice i
where p.PolicyId = c.PolicyId
and p.ParentPolicyId is not null
and parent.PolicyId = p.ParentPolicyId
and pil.PolicyId = p.PolicyId
and c.PersonEventId = pe.PersonEventId
and pn.RolePlayerId = pe.InsuredLifeId
and pil.RolePlayerId = pn.RolePlayerId
and pa.ClaimId = c.ClaimId
and c.ClaimStatusId in (9,14)
and i.InvoiceDate >= '2020-11-01'
and i.CreatedDate >= @startDate
and i.CreatedDate <= @endDate
and i.PolicyId = parent.PolicyId
and i.InvoiceDate > pn.DateOfDeath
and (not exists(select i2.InvoiceId from billing.Invoice i2, billing.Transactions t, billing.InvoiceAllocation ia
where i2.PolicyId = i.PolicyId and i2.InvoiceDate = i.InvoiceDate
and ia.InvoiceId = i2.InvoiceId and i2.InvoiceId = i.InvoiceId and t.TransactionId = ia.TransactionId
and t.TransactionTypeId = 4))
and (not exists(select t.TransactionId from billing.Transactions t
where t.RolePlayerId = parent.PolicyOwnerId and (t.TransactionDate >= dateadd(DD, 1, i.InvoiceDate))
AND t.TransactionDate <= dateadd(DD, 1, EOMONTH(i.InvoiceDate))
and t.TransactionTypeId = 4 and CHARINDEX('Refund', t.RmaReference) > 0))
and (not exists(select t.TransactionId from billing.Transactions t
where t.RolePlayerId = parent.PolicyOwnerId and (t.CreatedDate >= dateadd(DD, 1, i.InvoiceDate))
AND t.CreatedDate <= dateadd(DD, 1, EOMONTH(i.InvoiceDate))
and t.TransactionTypeId = 3 and t.Amount = i.TotalInvoiceAmount))
and ((select count(i2.InvoiceId) from billing.Invoice i2 where i2.PolicyId = i.PolicyId
and i2.InvoiceDate = i.InvoiceDate) = 1)
and exists(select roleplayerid from client.FinPayee f where f.roleplayerid = parent.policyownerid)

--select * from @InvoicesToBeAdjusted
begin tran trxCorrectUnpaidInvoices
-- Create credit notes for incorrect unpaid invoices
  insert into [billing].[Transactions] (InvoiceId, RolePlayerId, BankStatementEntryId, TransactionTypeLinkId,
  Amount, TransactionDate, BankReference, TransactionTypeId, CreatedDate, ModifiedDate, CreatedBy, ModifiedBy, RmaReference)
  (select InvoiceId, PolicyOwnerId, null, 2, InvoiceAmount, EOMONTH(InvoiceDate), '',
   4, (select getdate()), (select getdate()), 'system@randmutual.co.za', 'system@randmutual.co.za',
   concat('Premium Adjustment ',InvoiceNumber) 
   from @InvoicesToBeAdjusted
   where PremiumContribution > 0)

-- Settle incorrect unpaid invoices
    insert into billing.InvoiceAllocation (TransactionId, CreatedDate, CreatedBy,
		ModifiedBy, ModifiedDate, InvoiceId, Amount, ClaimRecoveryId)
		(select t.TransactionId, t.CreatedDate, t.CreatedBy,
		 t.ModifiedBy, t.ModifiedDate, t.InvoiceId, t.Amount, null from billing.Transactions t, billing.Invoice i where
		 t.TransactionTypeId = 4 and t.CreatedDate >= '2020-11-01' and
		 t.InvoiceId is not null and i.InvoiceId = t.InvoiceId and t.RmaReference = concat('Premium Adjustment ', i.InvoiceNumber)
		 and not exists (select ia.InvoiceAllocationId from billing.InvoiceAllocation ia
		 where ia.TransactionId = t.TransactionId))

	-- Add Invoices
	insert into [billing].[Invoice] (PolicyId, CollectionDate, TotalInvoiceAmount, InvoiceStatusId, InvoiceNumber, InvoiceDate,
	 CreatedBy, ModifiedBy, CreatedDate, ModifiedDate)
	select p.PolicyId, i.CollectionDate, (i.InvoiceAmount - i.PremiumContribution), 3, '', i.InvoiceDate,
	 'system@randmutual.co.za', 'system@randmutual.co.za', (select getdate()), (select getdate())
	from @InvoicesToBeAdjusted i, policy.Policy p
	where PremiumContribution > 0 and p.PolicyId = i.PolicyId

     -- Post Invoice Transactions
	insert into [billing].[Transactions] (InvoiceId, RolePlayerId, TransactionTypeLinkId, Amount, TransactionDate, BankReference,
	TransactionTypeId, CreatedBy, ModifiedBy, CreatedDate, ModifiedDate)
	select i.InvoiceId, p.PolicyOwnerId, 1, i.TotalInvoiceAmount, i.InvoiceDate, p.PolicyNumber, 6,
	'system@randmutual.co.za', 'system@randmutual.co.za', (select getdate()), (select getdate())
	from billing.Invoice i, policy.Policy p
	where i.InvoiceDate >= '2020-11-01' and p.PolicyId = i.PolicyId
	and not exists (select t.TransactionId from billing.Transactions t 
	where t.InvoiceId = i.InvoiceId and t.TransactionTypeId = 6)

	commit tran CorrectUnpaidInvoices
END