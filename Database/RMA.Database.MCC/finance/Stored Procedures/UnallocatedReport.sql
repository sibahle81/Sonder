

-- =============================================
-- Author:		Gram Letoaba
-- Create date: 2020/06/23
-- EXEC [billing].[RefundsReport] @StartDate='2020-01-01', @EndDate='2020-09-30'
-- =============================================
CREATE PROCEDURE [finance].[UnallocatedReport]
    @StartDate AS DATE,
	@EndDate AS DATE

AS
BEGIN  

	

SELECT distinct 
P.company as [CompanyNo]
 ,P.Branch br_no
,AccountNo as [Bank Account]
,T.amount as Amount
,submissionDate as [Date]
,BankReference as  [Name]
,'ZAR' as Currency_no
from 
[billing].[Transactions] T  
  INNER JOIN [billing].[invoice] I ON T.InvoiceId = I.InvoiceId 
  INNER JOIN [policy].[policy]  POL ON I.PolicyId = POL.PolicyId
  INNER JOIN [payment].[Payment] P ON POL.PolicyId = P.PolicyId
  INNER JOIN [common].[PaymentStatus] S ON P.PaymentStatusId = S.Id
  INNER JOIN common.paymenttype PT ON P.PaymentTypeId = PT.ID 
  where (submissionDate BETWEEN @StartDate AND @EndDate)
  and P.company is not null		

	
  
END


 

 select * 
 from [common].[PaymentStatus]