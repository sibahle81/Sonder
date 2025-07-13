CREATE PROCEDURE [payment].[PaymentPoolSearch] 
(
	@PageNumber AS INT,
	@RowsOfPage AS INT,
	@SortingCol AS VARCHAR(100) ='PaymentId',
	@SortType AS VARCHAR(100) = 'DESC',
	@SearchCreatia as VARCHAR(150) = '',
	@ReAllocate		    AS	bit	= 0,
	@UserLoggedIn		AS	int	= 0,
	@WorkPoolId		    AS	int	= 0,
	@StartDate AS varchar(10),
	@EndDate AS varchar(10),
	@PaymentTypeId as Int,
	@PaymentStatusId as Int,
	@RecordCount INT = 0 OUTPUT
	--execute [payment].[PaymentPoolSearch] 1, 500, 'PaymentId', 'desc', '108',1,112,20, '2022-05-05', '2023-07-20', 0,0,0
)
AS 
BEGIN
	DECLARE @Select AS NVARCHAR(MAX)
	DECLARE @SelectCount As NVARCHAR(MAX)
	DECLARE @whereStatement As NVARCHAR(MAX)
	Declare @WhereDate As NVARCHAR(MAX) = ''
	Declare @PaymentTypeCheck As NVARCHAR(MAX) = ''
	Declare @PaymentStatusCheck As NVARCHAR(MAX) = ''
	Declare @WorkpoolCheck As NVARCHAR(MAX) = ''
	Declare @UserLoggedCheck As NVARCHAR(MAX) = ''
	Declare @SearchCreatiaCheck As NVARCHAR(MAX) = ''

		BEGIN
			SET @WhereDate = ' Where (Cast(P.ModifiedDate as Date) BETWEEN '''+ @startDate +''' AND ''' + @enddate +''')'
		END

		IF(@PaymentTypeId > 0)
			BEGIN
				SET @PaymentTypeCheck = ' AND (PaymentTypeId = '+ Cast(@PaymentTypeId as varchar) +')'
			END
		IF(@PaymentStatusId > 0)
			BEGIN
				SET @PaymentStatusCheck = ' AND (PaymentStatusId = '+ Cast(@PaymentStatusId as varchar) +')' 
			END
		IF(@WorkPoolId > 0)
			BEGIN
				SET @WorkpoolCheck = ' AND (PW.WORKPOOLID = '+ Cast(@WorkPoolId as varchar) +')' 
			END
		--IF(@UserLoggedIn > 0 AND @ReAllocate = 1)
		--	BEGIN
		--		SET @UserLoggedCheck = ' AND (PW.AssignedToUserId is null OR PW.AssignedToUserId = '+ Cast(@UserLoggedIn as varchar) +')' 
		--	END
		IF(@UserLoggedIn > 0 AND @ReAllocate = 0)
			BEGIN
				SET @UserLoggedCheck = ' AND (PW.AssignedToUserId = '+ Cast(@UserLoggedIn as varchar) +')' 
			END
		IF(@SearchCreatia != '')
			BEGIN
				SET @SearchCreatiaCheck = ' AND (([ClaimReference] like ''%'+@SearchCreatia+'%'')
				            OR ([PolicyReference] like ''%'+@SearchCreatia+'%'')
							OR ([Reference] like ''%'+@SearchCreatia+'%'')
							OR ([BatchReference] like ''%'+@SearchCreatia+'%'')
							OR ([Payee] like ''%'+@SearchCreatia+'%'')
							OR ([IdNumber] like ''%'+@SearchCreatia+'%'')
							OR ([AccountNo] like ''%'+@SearchCreatia+'%'')
							OR ([BrokerName] like ''%'+@SearchCreatia+'%'')
							OR (R.DisplayName like ''%'+@SearchCreatia+'%'')
							OR (F.[FinPayeNumber] like ''%'+@SearchCreatia+'%'')
							OR ([BrokerCode] like ''%'+@SearchCreatia+'%''))'
			END
    --END

	SET @whereStatement = @whereDate
	SET @whereStatement = @whereStatement + @WorkpoolCheck
	SET @whereStatement = @whereStatement + @UserLoggedCheck
	IF(len(@PaymentTypeCheck) > 0) set @whereStatement = @whereStatement + @PaymentTypeCheck
	IF(len(@PaymentStatusCheck) > 0) set @whereStatement = @whereStatement + @PaymentStatusCheck      
	IF(len(@SearchCreatiaCheck) > 0) set @whereStatement = @whereStatement + @SearchCreatiaCheck

	PRINT @whereStatement
	DECLARE @orderQuery AS NVARCHAR(MAX) 
	SET @orderQuery = ' ORDER BY '
	IF (@SortingCol = 'PaymentId')
	  BEGIN
		  SET @orderQuery = @orderQuery + ' PaymentId '
		  SET @orderQuery = @orderQuery + @SortType
	END

   SET @Select = 'SELECT DISTINCT
					[PaymentId],
				[ClaimId],
				P.[PolicyId],
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
				P.[EmailAddress],
				P.[ClaimTypeId] AS [ClaimType],
				[ErrorDescription],
				[SubmissionDate],
				[PaymentConfirmationDate],
				[ClientNotificationDate],
				[CanResubmit],
				[PaymentRejectionTypeId] AS [PaymentRejectionType],
				P.[ClientTypeId] AS [ClientType],
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
				CASE WHEN [IsImmediatePayment] IS NULL THEN CAST(0 As bit) ELSE [IsImmediatePayment] END AS [IsImmediatePayment],
				[RecalledDate],
				[StrikeDate],
				R.DisplayName AS [MemberName],
				F.[FinPayeNumber] AS [MemberNumber],
				CASE WHEN [IsForex] IS NULL THEN CAST(0 As bit) ELSE [IsForex] END AS [IsForex],
				CAST(0 As bit) AS IsDebtorCheck,
				[Currency],
				PW.AssignedToUserID AS AssignedTo,	
				us.DisplayName AS UserName,	
				us.id AS UserId,
				RANK() OVER (PARTITION BY PaymentId ORDER BY PW.ModifiedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	payment.Payment					AS P	ON PW.ITEMID = P.PaymentId  
				LEFT JOIN   [policy].[Policy]               AS PO   ON P.PolicyId = PO.PolicyId
				LEFT JOIN   [client].[RolePlayer]           AS R    ON PO.PolicyPayeeId = R.RolePlayerId
				LEFT JOIN   [client].[FinPayee]				AS F    ON R.RolePlayerId = F.RolePlayerId
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id
	'+@whereStatement+'	'+@orderQuery +'
	OFFSET ('+CAST(@PageNumber as nvarchar(15))+'-1) * '+CAST(@RowsOfPage as nvarchar(15))+' ROWS
	FETCH NEXT '+CAST(@RowsOfPage as nvarchar(15))+' ROWS ONLY'

	SET @SelectCount = 'Select @RecordCount = (SELECT 
		COUNT(*)
		from (SELECT DISTINCT
					[PaymentId],
				[ClaimId],
				P.[PolicyId],
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
				P.[EmailAddress],
				P.[ClaimTypeId] AS [ClaimType],
				[ErrorDescription],
				[SubmissionDate],
				[PaymentConfirmationDate],
				[ClientNotificationDate],
				[CanResubmit],
				[PaymentRejectionTypeId] AS [PaymentRejectionType],
				P.[ClientTypeId] AS [ClientType],
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
				CASE WHEN [IsImmediatePayment] IS NULL THEN CAST(0 As bit) ELSE [IsImmediatePayment] END AS [IsImmediatePayment],
				[RecalledDate],
				[StrikeDate],
				R.DisplayName AS [MemberName],
				F.[FinPayeNumber] AS [MemberNumber],
				CASE WHEN [IsForex] IS NULL THEN CAST(0 As bit) ELSE [IsForex] END AS [IsForex],
				CAST(0 As bit) AS IsDebtorCheck,
				[Currency],
				PW.AssignedToUserID AS AssignedTo,	
				us.DisplayName AS UserName,	
				us.id AS UserId,
				RANK() OVER (PARTITION BY PaymentId ORDER BY PW.ModifiedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	payment.Payment					AS P	ON PW.ITEMID = P.PaymentId  
				LEFT JOIN   [policy].[Policy]               AS PO   ON P.PolicyId = PO.PolicyId
				LEFT JOIN   [client].[RolePlayer]           AS R    ON PO.PolicyPayeeId = R.RolePlayerId
				LEFT JOIN   [client].[FinPayee]				AS F    ON R.RolePlayerId = F.RolePlayerId
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id
		'+@whereStatement+')s)'
	 
	
	Print @Select
	Print @SelectCount

	EXEC SP_EXECUTESQL @Select

	DECLARE @ParamDefinition AS NVARCHAR(50)	
	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT	
END