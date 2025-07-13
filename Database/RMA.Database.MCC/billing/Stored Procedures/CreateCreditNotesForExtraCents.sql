
CREATE PROCEDURE [billing].[CreateCreditNotesForExtraCents]
AS BEGIN
DECLARE @AffectedInvoices table(PolicyId int, PolicyOwnerId int,
InvoiceId int, InvoiceNumber varchar(50), InvoiceDate date, Amount decimal (18,2));
insert into @AffectedInvoices
select p.PolicyId, p.PolicyOwnerId, i.InvoiceId, i.InvoiceNumber, i.InvoiceDate, i.TotalInvoiceAmount
from policy.Policy p, billing.Invoice i
where p.PolicyId = i.PolicyId
and i.InvoiceDate >= '2020-11-01'
and (not exists(select i2.InvoiceId from billing.Invoice i2, billing.Transactions t, billing.InvoiceAllocation ia
where i2.PolicyId = i.PolicyId and i2.InvoiceDate = i.InvoiceDate
and ia.InvoiceId = i2.InvoiceId and i2.InvoiceId = i.InvoiceId and t.TransactionId = ia.TransactionId
and t.TransactionTypeId = 4 and t.RmaReference like '%Cents%'))
and (i.TotalInvoiceAmount - round(i.TotalInvoiceAmount, 1)) > 0

  insert into [billing].[Transactions] (InvoiceId, RolePlayerId, BankStatementEntryId, TransactionTypeLinkId,
  Amount, TransactionDate, BankReference, TransactionTypeId, CreatedDate, ModifiedDate, CreatedBy, ModifiedBy, RmaReference)
  (select InvoiceId, PolicyOwnerId, null, 2, (Amount - round(Amount, 1)), EOMONTH(InvoiceDate), '',
   4, (select getdate()), (select getdate()), 'system@randmutual.co.za', 'system@randmutual.co.za',
   concat('Premium Adjustment (Cents) ',InvoiceNumber) 
   from @AffectedInvoices)

  insert into billing.InvoiceAllocation (TransactionId, CreatedDate, CreatedBy,
		ModifiedBy, ModifiedDate, InvoiceId, Amount, ClaimRecoveryId)
		(select t.TransactionId, t.CreatedDate, t.CreatedBy,
		 t.ModifiedBy, t.ModifiedDate, t.InvoiceId, t.Amount, null from billing.Transactions t, billing.Invoice i where
		 t.TransactionTypeId = 4 and t.CreatedDate >= '2020-11-01' and
		 t.InvoiceId is not null and i.InvoiceId = t.InvoiceId and t.RmaReference = concat('Premium Adjustment (Cents) ', i.InvoiceNumber)
		 and not exists (select ia.InvoiceAllocationId from billing.InvoiceAllocation ia
		 where ia.TransactionId = t.TransactionId))
END