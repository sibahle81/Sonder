create PROCEDURE [policy].GetBillingReport
AS
select distinct
Month(ci.InvoiceDate) as 'Month',
ci.InvoiceDate,
pp.PolicyNumber,
pp.InstallmentPremium,
ci.TotalInvoiceAmount,
po.Name as 'Product',
Month(ci.CollectionDate) as 'PremiumPeriod',
Year(ci.InvoiceDate) as 'FinancialYear'
from [billing].[Invoice] (nolock) ci
inner join policy.Policy (nolock) pp on ci.PolicyId = pp.PolicyId
inner join product.ProductOption  (nolock) po on po.Id = pp.ProductOptionId
inner join policy.PolicyLifeExtension  (nolock) ple on ple.PolicyId = pp.PolicyId

