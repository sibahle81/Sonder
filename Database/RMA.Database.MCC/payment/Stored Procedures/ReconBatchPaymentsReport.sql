
CREATE PROCEDURE [payment].[ReconBatchPaymentsReport]  (  
		@StartDate AS datetime = NULL,
		@EndDate AS datetime = NULL
		 )
AS
/*

exec [payment].[ReconBatchPaymentsReport] 
	   @StartDate = null,
       @EndDate =  null

*/

BEGIN 


declare	@PaymentStatus AS INT = 5,
		@PaymentType AS INT = NULL

SELECT 
	
    [BatchReference] as BatchNumber, 	
	min(b.CreatedDate) as BatchDate,
	min(P.SubmissionDate) as SubmissionDate,
	min(P.ReconciliationDate ) as ReconciliationDate,
	min(P.RejectionDate) as RejectionDate,
	sum([Amount]) as ApprovedPayment,
	sum([Amount]) as PendingPayment,
	sum([Amount]) as SubmittedPayment,
	sum([Amount]) as SubmissionDate,
	(sum([Amount]) - sum([Amount])) as Variance
	FROM Payment.payment p(nolock)
	 OUTER APPLY	(SELECT TOP 1 bse.StatementNumber AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId 
										and facs.Reference2 = bse.UserReference2 -- adding in this line and looks to be working
				     ) facs
	inner join [payment].[PaymentSubmissionBatch] b
	on b.Id = p.PaymentSubmissonBatchid	 
	where ((p.PaymentStatusId = @PaymentStatus)
			AND (@PaymentType IS NULL   OR  p.PaymentTypeId = @paymentType)
			AND (@StartDate  IS NULL OR p.ReconciliationDate >= @StartDate)
			AND (@EndDate IS NULL OR p.ReconciliationDate <= @EndDate))
     GROUP BY [BatchReference]
	return;



	
END