
CREATE PROCEDURE [payment].[ReconBatchPaymentsReportTest]  (  
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
	p.PaymentStatusId,
	case when p.PaymentStatusId = 5 then sum([Amount]) else 0 end as ApprovedPayment,
	case when p.PaymentStatusId = 4 then sum([Amount]) else 0 end as RejectedPayment,
	case when p.PaymentStatusId = 1 then sum([Amount]) else 0 end as PendingPayment,
	case when p.PaymentStatusId = 2 then sum([Amount]) else 0 end as SubmittedPayment,
	case when PaymentStatusId = 5 then (sum([Amount]) - sum([Amount])) else 0 end as Variance 

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
	where ((p.PaymentStatusId in (5,4,2,1))
			--AND (@PaymentType IS NULL   OR  p.PaymentTypeId = @paymentType)
			AND (@StartDate  IS NULL OR p.ReconciliationDate >= @StartDate)
			AND (@EndDate IS NULL OR p.ReconciliationDate <= @EndDate))
     GROUP BY [BatchReference],p.PaymentStatusId



	return;
END