CREATE PROCEDURE [billing].[CFPAgeAnalysis]
as
select distinct
cfp.FinPayeNumber  [DebtorNumber],
cp.FirstName + ' ' + cp.Surname [Name],
bse.UserReference2 [ReferenceNumber],
bse.BankAccountNumber,
 bt.Amount [PremiumReceived],
 (case when DATEDIFF(month, bql.CollectionDate, getdate()) < 30 then bql.TotalInvoiceAmount else 0 end) + 
 (case when (DATEDIFF(month, bql.CollectionDate, getdate()) > 30 and DATEDIFF(month, bql.CollectionDate, getdate()) <=60)then bql.TotalInvoiceAmount else 0 end) +
 (case when (DATEDIFF(month, bql.CollectionDate, getdate()) > 60 and DATEDIFF(month, bql.CollectionDate, getdate()) <=90)then bql.TotalInvoiceAmount else 0 end) +
 (case when (DATEDIFF(month, bql.CollectionDate, getdate()) > 90 and DATEDIFF(month, bql.CollectionDate, getdate()) <=120)then bql.TotalInvoiceAmount else 0 end) +
 (case when DATEDIFF(month, bql.CollectionDate, getdate()) > 120 then bql.TotalInvoiceAmount else 0 end )
 [OutstandingBalance],
case when DATEDIFF(month, bql.CollectionDate, getdate()) < 30 then bql.TotalInvoiceAmount else 0 end [BalanceCurrent],
case when (DATEDIFF(month, bql.CollectionDate, getdate()) > 30 and DATEDIFF(month, bql.CollectionDate, getdate()) <=60)then bql.TotalInvoiceAmount else 0 end [Balance30days],
case when (DATEDIFF(month, bql.CollectionDate, getdate()) > 60 and DATEDIFF(month, bql.CollectionDate, getdate()) <=90)then bql.TotalInvoiceAmount else 0 end [Balance60days],
case when (DATEDIFF(month, bql.CollectionDate, getdate()) > 90 and DATEDIFF(month, bql.CollectionDate, getdate()) <=120)then bql.TotalInvoiceAmount else 0 end [Balance90days],
case when DATEDIFF(month, bql.CollectionDate, getdate()) > 120 then bql.TotalInvoiceAmount else 0 end [Balance120days+]

from [billing].[Invoice]  (NOLOCK) bql
inner join [policy].[Policy] (NOLOCK) pp on pp.PolicyId = bql.PolicyId
inner join [policy].PolicyLifeExtension (NOLOCK) ple on ple.PolicyId = pp.PolicyId
inner join [finance].[BankStatementEntry] (NOLOCK) bse on bse.UserReference2 = pp.PolicyNumber
inner join [client].[Person] (NOLOCK) cp on cp.RolePlayerId = pp.PolicyPayeeId
inner join [billing].[Transactions] (nolock) bt on bt.InvoiceId = bql.InvoiceId
inner join [billing].[UnallocatedPayment] (NOLOCK) bu on bu.[BankStatementEntryId] = bse.[BankStatementEntryId]
inner join [client].[FinPayee] (NOLOCK) cfp on cfp.RolePlayerId = pp.PolicyPayeeId

where InvoiceStatusId not in (1, 10, 12, 13) and bse.BankStatementEntryTypeId = 2