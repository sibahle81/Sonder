



CREATE PROCEDURE [claim].[PaymentReversalReport3]
	@StartDate		As Date,
	@EndDate		AS Date,
	@BranchId			AS VARCHAR(50),
	@ProductClassId			AS VARCHAR(50),
	@ProductId		AS VARCHAR(50),
	@ReversalReason AS VARCHAR(50),
	@MonthId			AS VARCHAR(50)
	
AS

BEGIN 

SET @MonthId = CASE WHEN @MonthId = 1 THEN 'January'
				  WHEN @MonthId = 2 THEN 'February' 
				  WHEN @MonthId = 3 THEN 'March' 
				  WHEN @MonthId = 4 THEN 'April'
				  WHEN @MonthId = 5 THEN 'May'
				  WHEN @MonthId = 6 THEN 'June'
				  WHEN @MonthId = 7 THEN 'July'
				  WHEN @MonthId = 8 THEN 'August'
				  WHEN @MonthId = 9 THEN 'September'
				  WHEN @MonthId = 10 THEN 'October'
				  WHEN @MonthId = 11 THEN 'November'
				  WHEN @MonthId = 12 THEN 'December'end ;

SET @BranchId = CASE WHEN @BranchId = 1 THEN 'Johannesburg'
				   WHEN @BranchId = 2 THEN 'Klerksdorp' 
				   WHEN @BranchId = 3 THEN 'Carletonville' 
				   WHEN @BranchId = 4 THEN 'Rustenburg'
				   WHEN @BranchId = 5 THEN 'Head Office'
				   WHEN @BranchId = 6 THEN 'Welkom'
				   WHEN @BranchId = 7 THEN 'Mpumalanga'
				   WHEN @BranchId = 8 THEN 'Anglogold Health Service - Non RMA Region'
				   WHEN @BranchId = 9 THEN 'West Vaal Region'
				    end ;

SET @ProductClassId = CASE WHEN @ProductClassId = 1 THEN 'Statutory'
				   WHEN @ProductClassId = 2 THEN 'Life' 
				   WHEN @ProductClassId = 3 THEN 'Assistance' 
				   WHEN @ProductClassId = 4 THEN 'OtherFSCA'
				   WHEN @ProductClassId = 5 THEN 'NonStatutory'
				    end ;


SET @ReversalReason = CASE WHEN @ReversalReason = 1 THEN 'CancellationCreditNote'
				   WHEN @ReversalReason = 2 THEN 'creditNote' 
				   WHEN @ReversalReason = 3 THEN 'DebtorAllocationDueToReversal' 
				   WHEN @ReversalReason = 4 THEN 'transactionreversal'
				   WHEN @ReversalReason = 5 THEN 'CreditnotePartially'
				   WHEN @ReversalReason = 6 THEN 'Claimrecoveryprocess'
				   WHEN @ReversalReason = 7 THEN ' '
				   WHEN @ReversalReason = 8 THEN 'PolicyInceptionChanges'
				    end ;


IF OBJECT_ID('[claim].[PaymentReversal]', 'U') IS NOT NULL
DROP TABLE [claim].[PaymentReversal];


SELECT DISTINCT  
CASE WHEN trns.TransactionId IS NOT NULL THEN trns.TransactionId 
     ELSE py.paymentID END	    as 'Transaction_ID'
,clm.ClaimReferenceNumber		as 'Claim_Number'
,b.[Name]						as 'Branch'
,py.Modifiedby					as 'Requested_reversal'
,py.payee						as 'Debtor_created'
,trns.REASON					as 'Reversal_Reason' ---Business will provide
,py.Amount						as 'Reversal_amount'
,py.ModifiedDate				as 'Date'
,pc.[NAME]						as 'Class'
,prd.[Name]	      				as 'Product'
,prd.Id							as 'ProductId'
,py.CreatedBy					as 'Authorised_By'
INTO [claim].[PaymentReversal]

FROM  [payment].[Payment] (NOLOCK) py  
LEFT JOIN [claim].[Claim] (NOLOCK) clm ON clm.claimid = py.claimid
LEFT JOIN [policy].[Policy] (NOLOCK) pol  ON clm.PolicyId = pol.PolicyId
LEFT JOIN  [billing].[Invoice] (NOLOCK) inv ON pol.PolicyId = inv.policyID  
LEFT JOIN [billing].[Transactions] (NOLOCK) trns on inv.invoiceid = trns.invoiceid 
LEFT JOIN [product].[ProductOption] (NOLOCK) prdo ON pol.ProductOptionId = prdo.Id   
LEFT JOIN [product].[Product] (NOLOCK) prd ON prdo.ProductId = prd.Id 
LEFT JOIN [common].[ProductClass] (NOLOCK) pc ON prd.ProductClassId = pc.Id 
LEFT JOIN [client].[Person] (NOLOCK) prsn ON trns.RolePlayerId = prsn.RolePlayerId
LEFT JOIN [client].[RolePlayer] rp ON prsn.RolePlayerId = rp.RolePlayerId 
LEFT JOIN [common].[Branch] (NOLOCK) b ON py.Branch = b.Id
WHERE py.PaymentStatusId = 9 
ORDER BY py.ModifiedDate DESC


SELECT DISTINCT [Transaction_ID]
      ,[Claim_Number]
      ,[Branch]
      ,[Requested_reversal]
      ,[Debtor_created]
      ,[Reversal_Reason]
      ,[Reversal_amount]
      ,[Date]
      ,[Class]
      ,[Product]
	  ,[ProductId]
      ,[Authorised_By] 
FROM [AZD-MCC].[claim].[PaymentReversalTest] 

WHERE [Date] BETWEEN @StartDate AND @EndDate 
and (@BranchId is NULL OR Branch like '%'+@BranchId+'%') 
AND (@ProductClassId is NULL OR [Class] = @ProductClassId) 
AND (@ProductId is NULL OR ProductId = @ProductId)
AND (@ReversalReason is NULL OR [Reversal_Reason] = @ReversalReason)
AND (@MonthId is NULL OR DATENAME ( MONTH,CONVERT(DATE,[Date])) = @MonthId) 

END