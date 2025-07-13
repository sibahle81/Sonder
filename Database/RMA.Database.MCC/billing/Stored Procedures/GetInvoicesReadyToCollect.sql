/* =============================================
Name:			GetInvoicesReadyToCollect
Description:	GetInvoicesReadyToCollect for non funeral products
Author:			Bongani Makelane
Create Date:	2023-07-25
============================================= */
CREATE PROCEDURE [billing].[GetInvoicesReadyToCollect] --'2023 jan 1', '2023 nov 22'
@collectionGenerationStartDate date,
@effectiveDate date
AS
BEGIN
select top 200  i.[InvoiceId]
      ,i.[TenantId]
      ,i.[PolicyId]
      ,i.[CollectionDate]
      ,i.[TotalInvoiceAmount]
      ,i.[InvoiceStatusId]
      ,i.[InvoiceNumber]
      ,i.[InvoiceDate]
      ,i.[NotificationDate]
      ,i.[IsDeleted]
      ,i.[CreatedBy]
      ,i.[CreatedDate]
      ,i.[ModifiedBy]
      ,i.[ModifiedDate]
        ,isnull(i.[SourceModuleId],0) as SourceModule
      ,isnull([SourceProcessId], 0) as SourceProcess, cs.id invoicestatus, isnull(i.PendingThirtyDaysLog,0)   PendingThirtyDaysLog 
from [billing].[Invoice] i
join  [billing].[Transactions] t on i.InvoiceId = t.InvoiceId
join common.invoicestatus cs on cs.id = i.invoicestatusid
join policy.policy pp on pp.PolicyId= i.PolicyId 
join product.productOption po on po.id = pp.ProductOptionId
join product.Product p on po.ProductId = p.id
and (p.UnderwriterId =1
or p.id in (select id from product.Product where code like '%VAPS%')) --product option filter can be removed once we are submitting for all products
and t.TransactionTypeId=6 and  not EXISTS (select invoiceid from billing.Collections where invoiceid =i.invoiceid)
and MONTH(i.CollectionDate) =MONTH(@effectiveDate) and YEAR(i.CollectionDate) =Year(@effectiveDate)
and Day(i.CollectionDate) =day(@effectiveDate)
END