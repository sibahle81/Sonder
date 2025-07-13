CREATE   PROCEDURE [payment].[Report_GetPaymentDetails]
	    @PaymentType int,
		@StartDate DateTime,
		@EndDate DateTime
AS 
BEGIN
/*

exec [payment].[Report_GetPaymentDetails] @PaymentType = 1, @StartDate = '2020-01-01', @EndDate = '2022-12-31'

*/
    
Declare @TempTable table(
BrokerName VarChar(150),
BrokerCode int,
PolicyReference VarChar(150),
ClaimReference VarChar(150),
Amount Decimal,
CreatedDate DATETIME,
SubmissionDate DATETIME,
PaymentConfirmationDate DATETIME,
ReconciliationDate DATETIME,
PaymentType VarChar(150),
ProductType VarChar(150),
PaymentTypeId VarChar(150),
ProductTypeId VarChar(150)
)

Insert Into @TempTable
Select Brokername,BrokerCode,PolicyReference,ClaimReference,Amount,CreatedDate,SubmissionDate,PaymentConfirmationDate,ReconciliationDate,p.Product,p.Product,pt.Id,p.PaymentId
From payment.Payment p
Inner Join common.PaymentType pt on pt.Id = p.PaymentTypeId
--Inner Join common.ProductType prt on prt.Id = p.Product
where PaymentTypeId = @PaymentType
AND CreatedDate between @StartDate and @EndDate

Select Brokername,BrokerCode,PolicyReference,ClaimReference,Amount,CreatedDate,SubmissionDate,PaymentConfirmationDate,ReconciliationDate,PaymentType,ProductType,PaymentTypeId,ProductTypeId From @TempTable

END
