CREATE PROCEDURE [policy].[GetBillingReportSummury]
AS
select 
sum(pp.InstallmentPremium) as 'TotalPremium',
sum(ci.TotalInvoiceAmount) as 'TotalInvoiceAmount'
from [billing].[Invoice] (nolock) ci
inner join policy.Policy (nolock) pp on ci.PolicyId = pp.PolicyId
inner join product.ProductOption  (nolock) po on po.Id = pp.ProductOptionId
inner join policy.PolicyLifeExtension  (nolock) ple on ple.PolicyId = pp.PolicyId
where ci.InvoiceNumber != ''