USE [AZU-MCC]
GO
/****** Object:  StoredProcedure [policy].[GetBillingReport]    Script Date: 2/3/2023 2:40:57 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create PROCEDURE billing.GetCollectionsReport
AS
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

select top 10 * from [billing].[Collections] 
select top 10 * from [billing].[Transactions]