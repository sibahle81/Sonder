﻿

CREATE PROCEDURE [payment].[ClaimsRejectReport] 
	
		@StartDate AS datetime = NULL,
		@EndDate AS datetime = NULL
		
AS
/*

exec [payment].[GetRejectedPayments]    
       @PaymentStatus = 0,
       @PaymentType = 0,
	   @StartDate = null,
       @EndDate = null

*/

BEGIN 
 
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
	[ClaimReference] 'Claim Number', 
	[PolicyReference], 
	[Reference] as 'Ref Number', 
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
	 
	/*where ( ( p.PaymentStatusId = 4 )
			AND (p.PaymentTypeId = 1)
			 AND (@StartDate  IS NULL OR p.RejectionDate >= @StartDate)
			AND (@EndDate IS NULL OR p.RejectionDate <= @EndDate))*/
     where  Cast(CreatedDate as Date) >= @StartDate and  Cast(CreatedDate as Date) <= @EndDate

	return;
END