CREATE PROCEDURE [billing].[GetCFPAllocationsException]
AS
select distinct
br.Name as brokerName,
po.[Name] as schemeName, 
cfp.FinPayeNumber as debtorNumber,
cps.FirstName + ' ' + cps.Surname as debtorName,
pp.policyNumber,
ps.[Name] as policyStatus,
Month(ci.CollectionDate) as period,
ci.InvoiceNumber as invoiceNumber,
bse.UserReference as userReference2,
bse.TransactionDate as transactionDate,
bse.StatementDate as statementDate,
bse.HyphenDateProcessed as hyphenDateProcessed,
bse.HyphenDateReceived as hyphenDateReceived,
bu.Amount as amount,
bse.BankAccountNumber as bankAccountNumber
from [billing].[Invoice] (nolock) ci
inner join policy.Policy (nolock) pp on ci.PolicyId = pp.PolicyId
inner join product.ProductOption  (nolock) po on po.Id = pp.ProductOptionId
inner join policy.PolicyLifeExtension  (nolock) ple on ple.PolicyId = pp.PolicyId
inner join [billing].[Transactions] (nolock) bt on bt.InvoiceId = ci.InvoiceId
inner join [finance].[BankStatementEntry] (NOLOCK) bse on bse.UserReference2 = pp.PolicyNumber
inner join [billing].[InvoiceAllocation] (NOLOCK) bu on bu.InvoiceId = ci.InvoiceId
inner join [client].[FinPayee] (NOLOCK) cfp on cfp.RolePlayerId = pp.PolicyPayeeId
inner join broker.Brokerage br on br.Id = pp.BrokerageId
inner join common.PolicyStatus ps on ps.Id = pp.PolicyStatusId
inner join  [client].[Person]  cps on cps.RolePlayerId = cfp.RolePlayerId