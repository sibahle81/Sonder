CREATE PROCEDURE billing.GetMonthlyOutstandingPremiums
AS
select distinct
Month(ci.InvoiceDate) as 'Month',
ci.InvoiceDate,
pp.PolicyNumber,
pp.InstallmentPremium,
ci.TotalInvoiceAmount,
(ci.TotalInvoiceAmount - bt.Amount) as 'OutstandingAmount',
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
where (ci.TotalInvoiceAmount - bt.Amount > 0)
