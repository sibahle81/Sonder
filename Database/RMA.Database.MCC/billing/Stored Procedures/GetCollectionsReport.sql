CREATE PROCEDURE [billing].[GetCollectionsReport]
AS
begin
select distinct
Month(ci.InvoiceDate) as 'Month',
ci.InvoiceDate,
pp.PolicyNumber,
pp.InstallmentPremium,
ci.TotalInvoiceAmount,
po.Name as 'Product',
 ci.CollectionDate,
 ci.InvoiceNumber,
 bt.Amount as 'PremiumReceived',
Month(ci.CollectionDate) as 'PremiumPeriod',
Year(ci.InvoiceDate) as 'FinancialYear'
from [billing].[Invoice] (nolock) ci
inner join policy.Policy (nolock) pp on ci.PolicyId = pp.PolicyId
inner join product.ProductOption  (nolock) po on po.Id = pp.ProductOptionId
inner join policy.PolicyLifeExtension  (nolock) ple on ple.PolicyId = pp.PolicyId
inner join [billing].[Transactions] (nolock) bt on bt.InvoiceId = ci.InvoiceId
inner join [finance].[BankStatementEntry] (NOLOCK) bse on bse.UserReference2 = pp.PolicyNumber
inner join [billing].[InvoiceAllocation] (NOLOCK) bu on bu.InvoiceId = ci.InvoiceId
where ci.InvoiceNumber != ''

END
