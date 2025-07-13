
CREATE PROCEDURE [finance].[FinanceDiscountReports]
	@StartDate As Date,
	@EndDate AS Date
	
AS
	BEGIN


select distinct 
SubmissionDate		as [DiscountDateRequested]
,SubmissionDate		as [DiscountDateProcessed]
, Payee				as [DebtorName]
,ClaimReference		as [ClaimNumber]
,py.Amount				as [AmountDiscounted]
,IdNumber			as [DebtorCode]
--,inv.invoiceNumber  as [InvoiceDiscounted]
,convert(varchar(20),null)               as [InvoiceDiscounted]
,prd.[name]		    as [Product]
,pc.[Name]          as [Class]
,msp.[Name]	        as [MedicalServiceProvider]
,clmnt.Reason		as [DiscountReason]
,pol.PolicyId       as PolicyId
into #DiscountReports   
from [claim].[Claim] (NOLOCK) clm 
inner JOIN [payment].[Payment] (NOLOCK) py ON clm.claimid = py.claimid
INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.PolicyId
INNER JOIN [billing].[Invoice] (NOLOCK) inv ON pol.PolicyId = inv.PolicyId
INNER JOIN [product].[ProductOption] (NOLOCK) prdo ON pol.ProductOptionId = prdo.Id
INNER JOIN [product].[Product] (NOLOCK) prd ON prdo.ProductId = prd.Id 
INNER JOIN [common].[Productclass]  (NOLOCK) pc ON prd.ProductClassId = pc.Id
INNER JOIN [billing].[Transactions] (NOLOCK) trns ON inv.InvoiceId = trns.InvoiceId
INNER JOIN [claim].[ClaimNote] (NOLOCK) clmnt ON clm.ClaimId = clmnt.ClaimId
left join client.MedicalServiceProvider (NOLOCK) msp on trns.RolePlayerId = msp.roleplayerid 
where SubmissionDate between @StartDate and @EndDate


update a 
set [InvoiceDiscounted] = inv.invoiceNumber
from #DiscountReports a 
inner join [billing].[Invoice] (NOLOCK) inv ON a.PolicyId = inv.PolicyId


select distinct 
[DiscountDateRequested]
,[DiscountDateProcessed]
,[DebtorName]
,[ClaimNumber]
,[AmountDiscounted]
,[DebtorCode]
,[InvoiceDiscounted]
,[Product]
,[Class]
,[MedicalServiceProvider]
,[DiscountReason]
from #DiscountReports

END