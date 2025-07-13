

CREATE PROCEDURE [claim].[PaymentReversalReport2]
	@StartDate As Date,
	@EndDate AS Date,
	@BRANCH AS VARCHAR,
	@CLASS AS VARCHAR,
	@PRODUCT AS VARCHAR,
	@ReversalReason AS VARCHAR,
	@MONTH AS INT
	
AS

BEGIN 


SELECT DISTINCT
trns.TransactionId				as 'Transaction ID'
,clm.ClaimReferenceNumber		as 'Claim Number'
,py.Branch						as 'Branch'
,''								as 'Requested reversal'
,py.payee						as 'Debtor created'
,''								as 'Reversal Reason' ---Business will provide
,trns.Amount					as 'Reversal amount'
,trns.TransactionDate			as 'Date'
,pc.[NAME]						as 'Class'
,prd.[Name]	      				as 'Product'
,''								as 'Authorised By'

FROM  [claim].[Claim] (NOLOCK) clm 
INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.PolicyId
INNER JOIN [billing].[Transactions] (NOLOCK) trns ON pol.policypayeeID = trns.roleplayerid 
INNER JOIN [product].[ProductOption] (NOLOCK) prdo ON pol.ProductOptionId = prdo.Id    
INNER JOIN [product].[Product] (NOLOCK) prd ON prdo.ProductId = prd.Id 
LEFT JOIN  [common].[ProductClass] (NOLOCK) pc ON prd.ProductClassId = pc.Id 
INNER JOIN [client].[Person] (NOLOCK) prsn ON trns.RolePlayerId = prsn.RolePlayerId
INNER JOIN [client].[RolePlayer] rp ON prsn.RolePlayerId = rp.RolePlayerId  
LEFT JOIN [payment].[Payment] (NOLOCK) py ON clm.claimid = py.claimid

WHERE trns.TransactionDate BETWEEN @StartDate AND @EndDate 
OR py.Branch = @BRANCH 
OR pc.[NAME] = @CLASS 
OR prd.[Name]	= @PRODUCT
--OR '' = @ReversalReason 
OR LEFT(RIGHT(CONVERT(varchar(10), trns.TransactionDate, 112),4),2) = @MONTH 

END