/* =============================================
Name:			GetDebtorProductBalancesForTerms
Description:	Get balance for Term related products
Author:			Bongani Makelane
Create Date:	2023-06-27
Change Date:	
Culprits:		
============================================= */
CREATE PROCEDURE [billing].[GetDebtorProductBalancesForTerms] --718018 ,1 
@roleplayerId int,
@underWritingYearId int
AS
BEGIN

SELECT 
 distinct Productoption.Code ProductOptionName,
[PRODUCTOPTION].Id AS ProductOptionId,
dbo.GetTransactionBalance(t.transactionid) Balance,
Invoice.PolicyId,invoice.invoiceid
FROM [client].Finpayee [DEBTOR]
INNER JOIN [policy].[Policy] [POLICY] ON [POLICY].PolicyPayeeId = [DEBTOR].RoleplayerId and [POLICY].parentpolicyid is null
INNER JOIN billing.Invoice [INVOICE] ON [INVOICE].PolicyId = [POLICY].PolicyId
inner join [billing].[Transactions] t on t.invoiceid = invoice.Invoiceid and t.TransactionTypeId =6

INNER JOIN product.ProductOption [PRODUCTOPTION] ON [PRODUCTOPTION].Id = [POLICY].PRODUCTOPTIONID 
INNER JOIN product.ProductOptionBillingIntegration [CONFIG] ON [CONFIG].ProductOptionId = [PRODUCTOPTION].Id
inner join common.Industry ind  on ind.id = [DEBTOR].IndustryId
inner join common.IndustryClass ic   on ind.IndustryClassId= ic.Id 
where [CONFIG].AllowTermsArrangement = 1
and [DEBTOR].roleplayerId=@roleplayerId 
END