
CREATE PROCEDURE [payment].[paymentSearch]  (   
		@PolicyNumber AS varChar(20) = NUll,
		@ClaimNumber AS VarChar(20) = NULL,
		@AccountNumber AS varChar(20) = NULL,
		@Payee AS varChar(20) = NULL,
		@IdNumber AS varChar(20) = NULL
		 )
AS
/*
exec [payment].[paymentSearch]  
		@PolicyNumber  = '01-202004-03351',
		@ClaimNumber   = '20000037',
		@AccountNumber   = '10091100583',
		@Payee    = 'MPHO MADISA',
		@IdNumber   = '8408075835089'

*/

BEGIN 
IF(@PolicyNumber != '')
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
	 OUTER APPLY	(SELECT TOP 1 bse.UserReference AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId 
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	 
	where (p.PolicyReference like '%'+@PolicyNumber+'%')
	return;
	END
IF(@ClaimNumber != '')
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
	 OUTER APPLY	(SELECT TOP 1 bse.UserReference AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId 
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	 
	where (p.ClaimReference like '%'+@ClaimNumber+'%')
	return;
 END
IF(@AccountNumber != '')
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
	 OUTER APPLY	(SELECT TOP 1 bse.UserReference AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId 
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	 
	where (p.AccountNo like '%'+@AccountNumber+'%')
	return;
 END
IF(@Payee != '')
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
	 OUTER APPLY	(SELECT TOP 1 bse.UserReference AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId 
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	 
	where (p.Payee like '%'+@Payee+'%')
	return;
 END
IF(@IdNumber != '')
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
	 OUTER APPLY	(SELECT TOP 1 bse.UserReference AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId 
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	 
	where (p.IdNumber like '%'+@IdNumber+'%')
	return;
 END
END