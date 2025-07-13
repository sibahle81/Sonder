CREATE PROCEDURE [payment].[GetPaymentsOverviewPaged]
	@DateFrom DATE,
	@DateTo DATE,
	@Page INT = 1,
    @PageSize INT = 10,
    @OrderBy VARCHAR(100) ='PaymentType',
    @isAscending BIT  = 1,
	@RowCount INT OUTPUT 

	WITH RECOMPILE
AS

 BEGIN 

	DECLARE @QueryResults varchar(max);
	DECLARE @OFFSET INT;
	
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
			[BankAccountTypeId] [int] NULL,
			[Payment Reference] [varchar](250) NULL,
			[Batch No] [varchar](250) NULL,
			[Authorised DATE] [datetime] NULL,
			[Submission DATE] [datetime] NULL,
			[Rejection DATE] [datetime] NULL,
			[Payment DATE] [datetime] NULL,
			[Reconciliation DATE] [datetime] NULL,
			[Client Notification DATE] [datetime] NULL,
			[Company] [varchar](100) NULL,
			[Branch] [varchar](100) NULL,
			[Product] [varchar](100) NULL,
			[PaymentTypeId] INT,
			[PaymentStatusId] INT,
			[ClaimTypeId] INT,
			[ClientTypeId] INT,
			[PayeeDetails] [varchar](80) NOT NULL,
			[ClaimNo] [varchar](250) NULL,
			[PolicyNo] [varchar](250) NULL,
			[Amount] [money] NOT NULL,
			[Account Details] [varchar](17) NOT NULL,
			[Error Description] [varchar](MAX) NULL,
			[SENDerAccountNo] [varchar](17) NULL,
			[BankStatementReference] [varchar](100) NULL,			
			[Scheme] [varchar](250) NULL,
			[BrokerName] [varchar](250) NULL,
			[EmailAddress]  [varchar](250) NULL,
			[IsReversed] BIT,
			[CreatedBy] [varchar](250) NULL,
			[MaxSubmissionCount] [int] NULL,
			[SubmissionCount] [int] NULL
	);

	  INSERT INTO #Payments EXEC [payment].[GetPayments] @DateFrom,@DateTo,1,44,1--only take pending claim payments for funeral
	  	  	   	   
	   CREATE TABLE #PaymentsOverview (
		    [Date] [DATE]  NOT NULL,
			[PaymentType] [varchar](50) NULL,
			[Product] [varchar](100) NULL,
			[SenderAccountNo] [varchar](17) NULL,
			[TotalAmount] [money] NOT NULL,
			[NoOfPayee] [int],
			[NoOfTransactions] [int]
		);
	 INSERT INTO #PaymentsOverview
		SELECT @DateTo [Date],
				 [PT].[Name] [PaymentType],
				 [P].[Product],
				 [P].[SenderAccountNo],
				 SUM([P].[Amount]) [TotalAmount],
				 COUNT(DISTINCT [P].[PayeeDetails]) [NoOfPayee],
				 COUNT([P].[PaymentId]) [NoOfTransactions]
				 FROM #Payments [P]
	  				INNER JOIN [Common].[PaymentType] [PT](NOLOCK) ON [P].[PaymentTypeId] = [PT].[Id]				
	  		GROUP BY 
					 [PT].[Name],
					 [P].[Product],
					 [P].[SenderAccountNo]

	SET @RowCount  = @@ROWCOUNT	 

	SET @QueryResults = N'SELECT *
			 FROM #PaymentsOverview 	
									ORDER BY ' + @OrderBy + CASE WHEN @isAscending = 1 THEN ' ASC' ELSE ' DESC ' END +
									' OFFSET '+ CONVERT (VARCHAR,@OFFSET) + ' ROWS FETCH NEXT ' +CONVERT (VARCHAR, @PageSize)+ ' ROWS ONLY'
	
	EXEC(@QueryResults)
	DROP TABLE #Payments
	DROP TABLE #PaymentsOverview

END
