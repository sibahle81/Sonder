
CREATE PROCEDURE [payment].[GetPaymentPool] 
(
	@PageNumber			AS	INT,
	@RowsOfPage			AS	INT,
	@SortingCol			AS	VARCHAR(100) = 'PaymentId',
	@SortType			AS	VARCHAR(100) = 'Desc',
	@SearchCreatia		AS	VARCHAR(150) = '',
	@ReAllocate		    AS	bit	= 0,
	@UserLoggedIn		AS	int	= 0,
	@WorkPoolId		    AS	int	= 0,
	@IsUserBox		    AS	int	= 0,
	--@PaymentTypeId      AS	int	= 0,
	--@PaymentStatusId    AS	int	= 0,
	@RecordCount		INT = 0 OUTPUT
)
AS
BEGIN
 -- BEGIN --DEBUGGING
	--	DECLARE	@PageNumber		AS INT			=	1;
	--	DECLARE	@RowsOfPage		AS INT			=	500;
	--	DECLARE	@SortingCol		AS VARCHAR(100) =	'iSTopEmployer';
	--	DECLARE	@SortType		AS VARCHAR(100) =	'Desc';
	--	DECLARE	@SearchCreatia	AS VARCHAR(150) =	'';
	--	DECLARE @ReAllocate		AS	bit	= 1;
	--	DECLARE @UserLoggedIn   AS	INT	= 103;
	--	DECLARE @WorkPoolId		AS	int	= 11;
	--	DECLARE @RecordCount	INT			=	0 ;
	--END

	BEGIN --CREATING TEMP TABLE 
		CREATE TABLE #PaymentPool  
			(
				[PaymentId]				INT,
				[ClaimId]				INT,
				[PolicyId]				INT,
				[PaymentInstructionId]	INT,
				[RefundHeaderId]		INT,
				[CanEdit] BIT,
				[PaymentStatus]		INT,
				[PaymentType]			INT,
				[Payee] VARCHAR(80),
				[Bank] VARCHAR(50),
				[BankBranch] VARCHAR(10),
				[AccountNo] VARCHAR(17),
				[Amount] [money],
				[RetainedCommission] MONEY,
				[Product] VARCHAR(100),
				[Company] VARCHAR(10),
				[Branch] VARCHAR(10),
				[SenderAccountNo] VARCHAR(17),
				[BrokerCode]			INT,
				[BrokerName] VARCHAR(80),
				[FSBAccredited] [bit],
				[ErrorCode] VARCHAR(50),
				[MaxSubmissionCount]	INT,
				[SubmissionCount]		INT,
				[BankAccountType]		INT,
				[IdNumber] VARCHAR(30),
				[EmailAddress] VARCHAR(100),
				[ClaimType]			INT,
				[ErrorDescription] VARCHAR(150),
				[SubmissionDate] DATETIME,
				[PaymentConfirmationDate] DATETIME,
				[ClientNotificationDate] DATETIME,
				[CanResubmit] BIT,
				[PaymentRejectionType] INT,
				[ClientType]			INT,
				[ClaimReference] VARCHAR(250),
				[PolicyReference] VARCHAR(250),
				[Reference] VARCHAR(250),
				[BatchReference] VARCHAR(250),
				[PaymentSubmissonBatchid] INT,
				[ReconciliationDate] DATETIME,
				[RejectionDate] DATETIME,
				[TransactionType] VARCHAR(20),
				[IsActive] BIT,
				[IsDeleted] BIT,
				[CreatedBy] VARCHAR(50),
				[CreatedDate] DATETIME,
				[ModifiedBy] VARCHAR(50),
				[ModifiedDate] DATETIME,
				[IsImmediatePayment] BIT,
				[RecalledDate] DATETIME,
				[StrikeDate] DATETIME,
				[IsForex] BIT,
				[Currency] VARCHAR(50),
				[AssignedTo]				INT,
				[UserName]				VARCHAR(250),				
				[UserId]					INT,
				[RowNum] INT,
			);
	END
	
	BEGIN --GETTING DATA
	IF(@ReAllocate = 1)
		BEGIN
			INSERT INTO #PaymentPool 
		SELECT DISTINCT
				[PaymentId],
				[ClaimId],
				[PolicyId],
				[PaymentInstructionId],
				[RefundHeaderId],
				[CanEdit],
				[PaymentStatusId] AS [PaymentStatus],
				[PaymentTypeId] AS [PaymentType],
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
				[BankAccountTypeId] AS [BankAccountType],
				[IdNumber],
				[EmailAddress],
				[ClaimTypeId] AS [ClaimType],
				[ErrorDescription],
				[SubmissionDate],
				[PaymentConfirmationDate],
				[ClientNotificationDate],
				[CanResubmit],
				[PaymentRejectionTypeId] AS [PaymentRejectionType],
				[ClientTypeId] AS [ClientType],
				[ClaimReference],
				[PolicyReference],
				[Reference],
				[BatchReference],
				[PaymentSubmissonBatchid],
				[ReconciliationDate],
				[RejectionDate],
				[TransactionType],
				P.[IsActive],
				P.[IsDeleted],
				P.[CreatedBy],
				P.[CreatedDate],
				P.[ModifiedBy],
				P.[ModifiedDate],
				CASE WHEN [IsImmediatePayment] IS NULL THEN 0 ELSE [IsImmediatePayment] END AS [IsImmediatePayment],
				[RecalledDate],
				[StrikeDate],
				CASE WHEN [IsForex] IS NULL THEN 0 ELSE [IsForex] END AS [IsForex],
				[Currency],
				PW.AssignedToUserID AS AssignedTo,	
				us.DisplayName AS UserName,	
				us.id AS UserId,
				RANK() OVER (PARTITION BY PaymentId ORDER BY PW.ModifiedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	payment.Payment					AS P	ON PW.ITEMID				    = P.PaymentId  
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id

				WHERE PW.WORKPOOLID = @WorkPoolId
				--AND (CL.ClaimStatusId not in  (@autoAcknowledged, @manualAcknowledged, @underInvestigation))
		END
	ELSE IF (@ReAllocate = 0 and @IsUserBox = 0)
		BEGIN
			INSERT INTO #PaymentPool 
		SELECT DISTINCT
					[PaymentId],
				[ClaimId],
				[PolicyId],
				[PaymentInstructionId],
				[RefundHeaderId],
				[CanEdit],
				[PaymentStatusId] AS [PaymentStatus],
				[PaymentTypeId] AS [PaymentType],
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
				[BankAccountTypeId] AS [BankAccountType],
				[IdNumber],
				[EmailAddress],
				[ClaimTypeId] AS [ClaimType],
				[ErrorDescription],
				[SubmissionDate],
				[PaymentConfirmationDate],
				[ClientNotificationDate],
				[CanResubmit],
				[PaymentRejectionTypeId] AS [PaymentRejectionType],
				[ClientTypeId] AS [ClientType],
				[ClaimReference],
				[PolicyReference],
				[Reference],
				[BatchReference],
				[PaymentSubmissonBatchid],
				[ReconciliationDate],
				[RejectionDate],
				[TransactionType],
				P.[IsActive],
				P.[IsDeleted],
				P.[CreatedBy],
				P.[CreatedDate],
				P.[ModifiedBy],
				P.[ModifiedDate],
				CASE WHEN [IsImmediatePayment] IS NULL THEN 0 ELSE [IsImmediatePayment] END AS [IsImmediatePayment],
				[RecalledDate],
				[StrikeDate],
				CASE WHEN [IsForex] IS NULL THEN 0 ELSE [IsForex] END AS [IsForex],
				[Currency],
				PW.AssignedToUserID AS AssignedTo,	
				us.DisplayName AS UserName,	
				us.id AS UserId,
				RANK() OVER (PARTITION BY PaymentId ORDER BY PW.ModifiedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	payment.Payment					AS P	ON PW.ITEMID				    = P.PaymentId  
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id
				
				WHERE PW.WORKPOOLID = @WorkPoolId
				AND PW.AssignedToUserId is null			
		END

	ELSE IF (@ReAllocate = 0 and @IsUserBox = 1)
		BEGIN
			INSERT INTO #PaymentPool 
		SELECT DISTINCT
					[PaymentId],
				[ClaimId],
				[PolicyId],
				[PaymentInstructionId],
				[RefundHeaderId],
				[CanEdit],
				[PaymentStatusId] AS [PaymentStatus],
				[PaymentTypeId] AS [PaymentType],
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
				[BankAccountTypeId] AS [BankAccountType],
				[IdNumber],
				[EmailAddress],
				[ClaimTypeId] AS [ClaimType],
				[ErrorDescription],
				[SubmissionDate],
				[PaymentConfirmationDate],
				[ClientNotificationDate],
				[CanResubmit],
				[PaymentRejectionTypeId] AS [PaymentRejectionType],
				[ClientTypeId] AS [ClientType],
				[ClaimReference],
				[PolicyReference],
				[Reference],
				[BatchReference],
				[PaymentSubmissonBatchid],
				[ReconciliationDate],
				[RejectionDate],
				[TransactionType],
				P.[IsActive],
				P.[IsDeleted],
				P.[CreatedBy],
				P.[CreatedDate],
				P.[ModifiedBy],
				P.[ModifiedDate],
				CASE WHEN [IsImmediatePayment] IS NULL THEN 0 ELSE [IsImmediatePayment] END AS [IsImmediatePayment],
				[RecalledDate],
				[StrikeDate],
				CASE WHEN [IsForex] IS NULL THEN 0 ELSE [IsForex] END AS [IsForex],
				[Currency],
				PW.AssignedToUserID AS AssignedTo,	
				us.DisplayName AS UserName,	
				us.id AS UserId,
				RANK() OVER (PARTITION BY PaymentId ORDER BY PW.ModifiedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	payment.Payment					AS P	ON PW.ITEMID				    = P.PaymentId  
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id
				
				WHERE PW.WORKPOOLID = @WorkPoolId
				AND PW.AssignedToUserId = @UserLoggedIn 			
		END
	END

	BEGIN --DELETE DUPLICATES
		DELETE FROM #PaymentPool
		WHERE RowNum > 1;
	END

	BEGIN -- CHECK CONDITIONS
		IF(@SearchCreatia IS NOT NULL AND @SearchCreatia != '')
		
			--update #PaymentPool set included = 0;
			update #PaymentPool set included = 1
			where [ClaimReference]      LIKE '%' + @SearchCreatia + '%'
				OR	([PolicyReference]			LIKE '%' + @SearchCreatia + '%') 						
				OR	([Reference]	LIKE '%' + @SearchCreatia + '%')
				OR	([BatchReference]			LIKE '%' + @SearchCreatia + '%')
				OR	([Payee]		LIKE '%' + @SearchCreatia + '%')
				OR	([BrokerName]		            LIKE '%' + @SearchCreatia + '%')
				OR	([BrokerCode]		            LIKE '%' + @SearchCreatia + '%')

		--IF(@PaymentTypeId > 0)
		--BEGIN
		--	update #PaymentPool set [IsDeleted] = 0
		--	WHERE PaymentType = @PaymentTypeId
		--END

		--IF(@PaymentStatusId > 0)
		--BEGIN
		--	update #PaymentPool set [IsDeleted] = 0
		--	WHERE PaymentStatus = @PaymentStatusId
		--END
		
	END

	BEGIN --GET RECORD COUNT
	--DELETE FROM #PaymentPool WHERE included = 0;
		SELECT @RecordCount = Count(*) from #PaymentPool
	END

	BEGIN --SORT BY CRITERIA
		IF(@SortingCol = 'paymentId' and @SortType = 'asc' )
		BEGIN
			select * from #PaymentPool 
			ORDER BY  PaymentId asc, CreatedDate 
			OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
		END
		ELSE IF(@SortingCol = 'paymentId' and @SortType = 'DESC' )
		BEGIN
			select * from #PaymentPool 
			ORDER BY  PaymentId desc, CreatedDate  
			OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
		END
	END

	BEGIN -- CLEAN UP
		IF OBJECT_ID('tempdb..#PaymentPool') IS NOT NULL DROP TABLE #PaymentPool;
	END
END