


CREATE PROCEDURE [claim].[ClaimDebtorReconReport]
	@StartDate As Date,
	@EndDate AS Date
	
AS
	BEGIN
		SELECT  DISTINCT
		trns.TransactionDate							AS 'Doc Date',
		--,trns.RMAReference							AS 'Doc Number'    ---RMAReference

			CASE WHEN trns.TransactionTypeId = 6 THEN inv.InvoiceNumber
                     WHEN trns.TransactionTypeId = 3 AND trns.BankReference LIKE '02-%' THEN trns.RmaReference 
                     WHEN trns.BankReference IS NULL THEN trns.RmaReference
                     WHEN trns.BankReference LIKE '' THEN trns.RmaReference 
                     ELSE trns.BankReference  END		AS 'Doc Number'
		,prd.[name]										AS 'Our Reference'
		,clm.ClaimReferenceNumber						AS 'Your Reference'
		,inv.invoiceNumber								AS 'Invoice Number' --invoiceNumber
		,trns.Amount									AS 'Doc Amount'
		,DisplayName									AS 'Name' 
		,clmnt.Reason									AS 'Comment'
		

		FROM [payment].[PaymentErrorAudit] pea
			LEFT JOIN [claim].[Claim] (NOLOCK) clm ON pea.claimid = clm.claimid 
			LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.PolicyId
			LEFT JOIN [billing].[Transactions] (NOLOCK) trns ON pol.policypayeeID = trns.roleplayerid 
			LEFT JOIN [billing].[Invoice] (NOLOCK) inv ON pol.PolicyId = inv.PolicyId
			LEFT JOIN [product].[ProductOption] (NOLOCK) prdo ON pol.ProductOptionId = prdo.Id    
			LEFT JOIN [product].[Product] (NOLOCK) prd ON prdo.ProductId = prd.Id 
			LEFT JOIN [client].[Person] (NOLOCK) prsn ON trns.RolePlayerId = prsn.RolePlayerId
			LEFT JOIN [client].[RolePlayer] rp ON prsn.RolePlayerId = rp.RolePlayerId  
			LEFT JOIN [claim].[ClaimNote] (NOLOCK) clmnt ON clm.ClaimId = clmnt.ClaimId
			LEFT JOIN [payment].[Payment] (NOLOCK) py ON clm.claimid = py.claimid
			LEFT JOIN [medical].[HealthCareProvider] hcp ON  rp.roleplayerid = hcp.RolePlayerId
			  
			 
	     WHERE
			trns.TransactionDate BETWEEN @StartDate AND @EndDate 
			--and DisplayName = @Name
		 and clmnt.ClaimStatusId is not null
		ORDER BY trns.TransactionDate DESC
	END