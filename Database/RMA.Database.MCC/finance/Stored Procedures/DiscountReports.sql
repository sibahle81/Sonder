
CREATE PROCEDURE [finance].[DiscountReports]
	@StartDate As Date,
	@EndDate AS Date
	
AS
	BEGIN
 --select distinct [DebtorName],
	--	 [class],
	--	 [DebtorCode],
	--	 [InvoiceDiscounted],
	--	 [AmountDiscounted]
	--	 [DiscountDateRequested],
	--	 [DiscountDateProcessed],
	--	 [DiscountReason] ,
	--	 [ClaimNumber] ,
	--	 [MedicalServiceProvider]
	--from  [finance].[DiscountReport]
	--	where [DiscountDateRequested] between @StartDate and @EndDate

SELECT  DISTINCT TOP 1000 
        
        trns.TransactionDate                            AS [DiscountDateRequested]
		,trns.TransactionDate							AS [DiscountDateProcessed]
		,prd.[name]										AS [Product]
		,pc.[Name]                                      AS [Class]
		,clm.ClaimReferenceNumber						AS [ClaimNumber]
		,inv.invoiceNumber								AS [InvoiceDiscounted]
		,trns.Amount									AS [AmountDiscounted]
		,DisplayName									AS [DebtorName]
		,clmnt.Reason									AS [DiscountReason]
		,py.IdNumber									AS [DebtorCode]
		,[hcp].[MedicalServiceProvider]									AS [MedicalServiceProvider]
		FROM 
			[claim].[Claim] (NOLOCK) clm 
			INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.PolicyId
			INNER JOIN [billing].[Transactions] (NOLOCK) trns ON pol.policypayeeID = trns.roleplayerid 
			INNER JOIN [billing].[Invoice] (NOLOCK) inv ON pol.PolicyId = inv.PolicyId
			INNER JOIN [product].[ProductOption] (NOLOCK) prdo ON pol.ProductOptionId = prdo.Id    
			INNER JOIN [product].[Product] (NOLOCK) prd ON prdo.ProductId = prd.Id 
			INNER JOIN [common].[Productclass]  (NOLOCK) pc ON prd.ProductClassId = pc.Id
			INNER JOIN [client].[Person] (NOLOCK) prsn ON trns.RolePlayerId = prsn.RolePlayerId
			INNER JOIN [client].[RolePlayer] rp ON prsn.RolePlayerId = rp.RolePlayerId  
			INNER JOIN [claim].[ClaimNote] (NOLOCK) clmnt ON clm.ClaimId = clmnt.ClaimId
			inner JOIN [payment].[Payment] (NOLOCK) py ON clm.claimid = py.claimid
			left join  [finance].[DiscountReport] hcp ON  clm.ClaimReferenceNumber = hcp.[ClaimNumber]
where trns.TransactionDate between @StartDate and @EndDate






			END