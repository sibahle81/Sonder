CREATE PROCEDURE [payment].[GetPaymentsPaged]
	@DateFrom DATE,
	@DateTo DATE,
	@PaymentTypeId INT=0,
	@ClaimTypeId INT = 0,
	@PaymentStatusId INT=0,
	@Query NVARCHAR(50) = NULL,
	@Page AS INT = 1,
    @PageSize AS INT = 10,
    @OrderBy AS VARCHAR(100) ='PaymentId',
    @isAscending AS BIT  = 1,
	@RowCount INT OUTPUT,
	@TotalAmount MONEY OUTPUT

	WITH RECOMPILE
AS
   BEGIN

	DECLARE @QueryResults varchar(max);
	DECLARE @OFFSET INT;
	SET @TotalAmount = 0;
	
	IF(@Page < 1)
	BEGIN
		SET @Page = 1;
	END

	SET @OFFSET = (@Page-1)*@PageSize;

	CREATE TABLE #Payments  (
		    [PaymentId] [int]  NOT NULL,
			[ClaimId] [int] NULL,
			[PolicyId] [int] NULL,
			[RefundHeaderId] [int] NULL,
			[Bank] [varchar](50) NULL,
			[BankBranch] [varchar](50) NULL,
			[BankAccountType] [int] NULL,
			[Reference] [varchar](250) NULL,
			[BatchReference] [varchar](250) NULL,
			[CreatedDate] [datetime] NULL,
			[SubmissionDate] [datetime] NULL,
			[RejectionDate] [datetime] NULL,
			[PaymentConfirmationDate] [datetime] NULL,
			[ReconciliationDate] [datetime] NULL,
			[ClientNotificationDate] [datetime] NULL,
			[Company] [varchar](100) NULL,
			[Branch] [varchar](100) NULL,
			[Product] [varchar](100) NULL,
			[PaymentType] INT,
			[PaymentStatus] INT,
			[ClaimType] INT,
			[ClientType] INT,
			[Payee] [varchar](80) NOT NULL,
			[ClaimReference] [varchar](250) NULL,
			[PolicyReference] [varchar](250) NULL,
			[Amount] [money] NOT NULL,
			[AccountNo] [varchar](17) NOT NULL,
			[ErrorDescription] [varchar](MAX) NULL,
			[SenderAccountNo] [varchar](17) NULL,
			[BankStatementReference] [varchar](100) NULL,			
			[Scheme] [varchar](250) NULL,
			[BrokerName] [varchar](250) NULL,
			[EmailAddress] [varchar](250) NULL,
			[IsReversed] BIT,
			[CreatedBy] [varchar](250) NULL,
			[MaxSubmissionCount] [int] NULL,
			[SubmissionCount] [int] NULL
	);

    INSERT INTO #Payments EXEC [payment].[GetPayments]	@DateFrom,@DateTo ,	@PaymentTypeId ,@ClaimTypeId ,@PaymentStatusId, @Query
	
	SET @RowCount = @@ROWCOUNT;
	
	IF @RowCount >0 
	BEGIN
	SET @TotalAmount = (SELECT SUM(Amount) FROM #Payments);
	END 

	SET @QueryResults = N'SELECT 
						[PaymentId],
						[ClaimId],
						[PolicyId],
						[RefundHeaderId],
						[Bank],
						[BankBranch],
						[BankAccountType],
						[Reference],
						[BatchReference],
						[CreatedDate],
						[SubmissionDate],
						[RejectionDate],
						[PaymentConfirmationDate],
						[ReconciliationDate],
						[ClientNotificationDate],
						[Company],
						[Branch],
						[Product],
						[PaymentType],
						[PaymentStatus],
						[ClaimType],
						[ClientType],
						[Payee],
						[ClaimReference],
						[PolicyReference],
						[Amount],
						[AccountNo],
						[ErrorDescription],
						[SenderAccountNo],
						[BankStatementReference],		
						[Scheme],
						[BrokerName],
						[EmailAddress],
						[IsReversed],
						[CreatedBy],
						[MaxSubmissionCount],
						[SubmissionCount]
							FROM #Payments
							GROUP BY 
						[PaymentId],
						[ClaimId],
						[PolicyId],
						[RefundHeaderId],
						[Bank],
						[BankBranch],
						[BankAccountType],
						[Reference],
						[BatchReference],
						[CreatedDate],
						[SubmissionDate],
						[RejectionDate],
						[PaymentConfirmationDate],
						[ReconciliationDate],
						[ClientNotificationDate],
						[Company],
						[Branch],
						[Product],
						[PaymentType],
						[PaymentStatus],
						[ClaimType],
						[ClientType],
						[Payee],
						[ClaimReference],
						[PolicyReference],
						[Amount],
						[AccountNo],
						[ErrorDescription],
						[SenderAccountNo],
						[BankStatementReference],		
						[Scheme],
						[BrokerName],
						[EmailAddress],
						[IsReversed],
						[CreatedBy],
						[MaxSubmissionCount],
						[SubmissionCount]
									ORDER BY ' + 'PaymentId' + CASE WHEN @isAscending = 1 THEN ' ASC' ELSE ' DESC ' END +
									' OFFSET '+ CONVERT (VARCHAR,@OFFSET) + ' ROWS FETCH NEXT ' +CONVERT (VARCHAR, @PageSize)+ ' ROWS ONLY'
	EXEC(@QueryResults)
		
	DROP TABLE #Payments

END
