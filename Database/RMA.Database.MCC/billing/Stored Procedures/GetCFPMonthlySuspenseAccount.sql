CREATE PROCEDURE [billing].[GetCFPMonthlySuspenseAccount]
AS
select distinct
Month(ci.InvoiceDate) as 'Month',
bse.UserReference1 ,
bse.UserReference2,

pp.PolicyNumber,
ci.TotalInvoiceAmount 'Amount',
 ci.CollectionDate 'Payment Date',
 bt.Amount as 'PremiumReceived',
Month(ci.CollectionDate) as 'PremiumPeriod'
from [billing].[Invoice] (nolock) ci
inner join policy.Policy (nolock) pp on ci.PolicyId = pp.PolicyId
inner join product.ProductOption  (nolock) po on po.Id = pp.ProductOptionId
inner join policy.PolicyLifeExtension  (nolock) ple on ple.PolicyId = pp.PolicyId
inner join [billing].[Transactions] (nolock) bt on bt.InvoiceId = ci.InvoiceId
inner join [finance].[BankStatementEntry] (NOLOCK) bse on bse.UserReference2 = pp.PolicyNumber
inner join [billing].[UnallocatedPayment] (NOLOCK) bu on bu.[BankStatementEntryId] = bse.[BankStatementEntryId]

