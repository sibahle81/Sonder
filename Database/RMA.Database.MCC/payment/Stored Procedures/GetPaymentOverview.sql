CREATE   PROCEDURE [payment].[GetPaymentOverview]  (   
       @CoverTypeIds AS VARCHAR(50),
       @BrokerageId AS INT = 0,
       @PaymentTypeId as INT)
AS

/*
exec [payment].[GetPaymentOverview]    
       @CoverTypeIds = '4,5,6,7',
       @BrokerageId = 0,
       @PaymentTypeId =1
*/

BEGIN 

DECLARE @PolicyIds Table(
policyId int
)

IF (@PaymentTypeId = 2)
BEGIN
	SELECT *, 
	BankStatementReference= facs.UserReference	 
	FROM Payment.payment p(nolock)
	 OUTER APPLY	(SELECT TOP 1 bse.StatementNumber AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	WHERE p.paymentTypeId = @PaymentTypeId
	return;
END

IF (@PaymentTypeId = 3)
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
	 OUTER APPLY	(SELECT TOP 1 bse.StatementNumber AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
	WHERE p.paymentTypeId = @PaymentTypeId and RefundHeaderId is not null
	return;
END

Declare @CoidBankAccount varchar(50), @NonCoidBankAccount varchar(50)
select @CoidBankAccount = ISNULL([value],'') from common.Settings where [key] = 'CoidBankAccount';
select @NonCoidBankAccount = ISNULL([value],'') from common.Settings where [key] = 'NonCoidBankAccount';

  IF (@CoverTypeIds = '8')
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
	 OUTER APPLY	(SELECT TOP 1 bse.StatementNumber AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
			WHERE  p.SenderAccountNo = @NonCoidBankAccount
			return;				          
       END

IF (@BrokerageId > 0 )
	BEGIN
	INSERT INTO @PolicyIds
		SELECT DISTINCT pol.PolicyId
				FROM product.productoptioncovertype (NOLOCK) poct
				inner join policy.[policy] (NOLOCK)pol on pol.ProductOptionId = poct.ProductOptionId
											AND pol.IsDeleted = 0
											AND poct.CoverTypeId in (SELECT [Data] FROM [dbo].[Split] (@CoverTypeIds,','))
				INNER JOIN broker.Brokerage (NOLOCK) brk on brk.Id = pol.BrokerageId
		WHERE pol.BrokerageId = @BrokerageId
	END
	ELSE
	BEGIN
		INSERT INTO @PolicyIds
		SELECT DISTINCT pol.PolicyId
		FROM product.productoptioncovertype (NOLOCK) poct
		inner join policy.[policy] (NOLOCK)pol on pol.ProductOptionId = poct.ProductOptionId
										AND pol.IsDeleted = 0
										AND poct.CoverTypeId in (SELECT [Data] FROM [dbo].[Split] (@CoverTypeIds,','))	
       END

       IF (@PaymentTypeId = 0) -- ALL
       BEGIN		
			-- check if commissions are not pulling
              SELECT 
			  [PaymentId], 
	[ClaimId], 
	p.[PolicyId], 
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
				inner join @PolicyIds pol on pol.policyId = p.PolicyId   
				 OUTER APPLY	(SELECT TOP 1 bse.StatementNumber AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
				-- where CreatedDate between @StartDate and @EndDate
				return;
       END


       IF (@PaymentTypeId = 1)
       BEGIN
             SELECT 
			 [PaymentId], 
	p.[ClaimId], 
	p.[PolicyId], 
	[PaymentInstructionId], 
	[RefundHeaderId], 
	[IsActive], 
	p.[IsDeleted], 
	p.[CreatedBy], 
	p.[CreatedDate], 
	p.[ModifiedBy], 
	p.[ModifiedDate], 
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
			 inner join claim.claim clm (nolock) on clm.ClaimId = p.ClaimId
			 inner join @PolicyIds pol on pol.policyId = clm.PolicyId
			 OUTER APPLY	(SELECT TOP 1 bse.StatementNumber AS UserReference
								 FROM [payment].[FacsTransactionResults] facs (nolock)
										inner join [finance].[BankStatementEntry] bse (nolock)
										on Convert(int,bse.[RequisitionNumber ]) = Convert(int,facs.[RequisitionNumber ])
										WHERE facs.PaymentId = p.PaymentId
										and TRIM(facs.Reference2) = TRIM(bse.UserReference2)
							) facs
             WHERE p.paymentTypeId = @PaymentTypeId and p.SenderAccountNo = @CoidBankAccount
       END
END