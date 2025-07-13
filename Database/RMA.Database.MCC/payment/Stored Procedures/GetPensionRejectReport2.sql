create PROCEDURE payment.GetPensionRejectReport2  
	
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
	p.[ClaimId], 
	[PolicyId], 
	[PaymentInstructionId], 
	[RefundHeaderId], 
	p.[IsActive], 
	p.[IsDeleted], 
	p.[CreatedBy], 
	p.[CreatedDate], 
	p.[ModifiedBy], 
	p.[ModifiedDate], 
	[CanEdit], 
	PaymentStatus = [PaymentStatusId], 
	PaymentType = [PaymentTypeId], 
	[Payee] as 'Payee', 
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
	p.[IdNumber], 
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
	BankStatementReference= facs.UserReference,
	ClientNotificationDate,
	penc.PensionCaseNumber AS 'Pension Case No'

	FROM Payment.payment p(nolock)
	left join client.Person cp(nolock) on cp.[IdNumber] = p.[IdNumber]
	left join pension.PensionRecipient pr(nolock) on pr.PersonId = cp.RolePlayerId
	left join pension.PensionClaimMap pcm(nolock) on pcm.PensionClaimMapID  = pr.PensionClaimMapID
	left join pension.PensionCase penc(nolock) on penc.PensionCaseid = pcm.PensionCaseid 
	OUTER APPLY	(SELECT TOP 1 bse.StatementNumber AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	 
	where ( ( p.PaymentStatusId = 4 )
			AND (p.PaymentTypeId = 7)
			AND (@StartDate  IS NULL OR p.RejectionDate >= @StartDate)
			AND (@EndDate IS NULL OR p.RejectionDate <= @EndDate))
     
	return;
END



exec [payment].[PensionsRejectReport]  '2016-06-02', '2023-07-02'