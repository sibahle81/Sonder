CREATE PROCEDURE [payment].[GetRejectedPayments]  ( 
		@PaymentStatus AS INT = 0,
		@PaymentType AS INT = 0,
		@StartDate AS datetime = NULL,
		@EndDate AS datetime = NULL
		 )
AS
/*

exec [payment].[GetRejectedPayments]    
       @PaymentStatus = 0,
       @PaymentType = 0,
	   @StartDate = null,
       @EndDate = null

*/

BEGIN 

if (@PaymentType = 0) SET @PaymentType = NULL;
if (@PaymentStatus = 0) SET @PaymentStatus = NULL;

SELECT 
	[PaymentId], 
	[ClaimId], 
	[PolicyId], 
	[PaymentInstructionId], 
	[RefundHeaderId], 
	[IsActive], 
	[IsDeleted], 
	[CreatedBy], 
	[CreatedDate], 
	[ModifiedBy], 
	[ModifiedDate], 
	[CanEdit], 
	PaymentStatus = [PaymentStatusId], 
	PaymentType = [PaymentTypeId], 
	[Payee], 
	[Bank], 
	[BankBranch], 
	[AccountNo], 
	[Amount], 
	[RetainedCommission], 
	[Product], 
	[Company], 
	[Branch], 
	[SenderAccountNo], 
	[BrokerCode], 
	[BrokerName], 
	[FSBAccredited], 
	[ErrorCode], 
	[MaxSubmissionCount], 
	[SubmissionCount], 
	BankAccountType = [BankAccountTypeId], 
	[IdNumber], 
	[EmailAddress], 
	ClaimType = [ClaimTypeId], 
	[ErrorDescription], 
	[SubmissionDate], 
	[PaymentConfirmationDate], 
	[ClientNotificationDate], 
	[CanResubmit], 
	RejectionType = [PaymentRejectionTypeId], 
	ClientType = [ClientTypeId], 
	[ClaimReference], 
	[PolicyReference], 
	[Reference], 
	[BatchReference], 
	[PaymentSubmissonBatchid], 
	[ReconciliationDate], 
	[RejectionDate], 
	[TransactionType],
	BankStatementReference= facs.UserReference	
	FROM Payment.payment p(nolock)
	 OUTER APPLY	(SELECT TOP 1 bse.StatementNumber AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	 
	where ((@PaymentStatus IS NULL   OR p.PaymentStatusId = @PaymentStatus )
			AND (@PaymentType IS NULL   OR  p.PaymentTypeId = @paymentType)
			AND (@StartDate  IS NULL OR p.RejectionDate >= @StartDate)
			AND (@EndDate IS NULL OR p.RejectionDate <= @EndDate))
     
	return;
END