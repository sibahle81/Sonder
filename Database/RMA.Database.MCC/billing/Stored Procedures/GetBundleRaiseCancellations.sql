/* =============================================
Name:			GetBundleRaiseCancellations
Description:	Get Cancelled Bundle Raises that have not been processed with credit notes
Author:			Bongani Makelane
Create Date:	2023-07-25
============================================= */
CREATE PROCEDURE [billing].[GetBundleRaiseCancellations]
AS
BEGIN
select top 50 i.[InvoiceId],pp.[PolicyId],t.[Amount],transactionId, t.roleplayerId
from [billing].[Invoice] i
join  [billing].[Transactions] t on i.InvoiceId = t.InvoiceId
join policy.policy pp on pp.PolicyId= i.PolicyId  and pp.PolicyStatusId = 2 
join product.productOption po on po.id = pp.ProductOptionId
join product.Product p on po.ProductId = p.id
and (p.UnderwriterId =1
or p.id in (select id from product.Product where code like '%VAPS%'))
where t.TransactionTypeId=6
END