
CREATE     PROCEDURE [billing].[GetUnallocatedPaymentsPaged]
	@DateType AS INT,
	@DateFrom AS DATE = NULL, 
	@DateTo AS DATE = NULL,
	@Search AS VARCHAR(50)= NULL,
	@Page AS INT = 1,
    @PageSize AS INT = 10,
    @OrderBy AS VARCHAR(100) ='UnallocatedPaymentId',
    @isAscending AS BIT  = 1,
	@BankAccNum VARCHAR(50) = NULL
AS
   BEGIN
	DECLARE @TotalRows INT;
	DECLARE @Query varchar(max);
	DECLARE @OFFSET INT;
	IF(@Page < 1)
	BEGIN
	SET @Page = 1;
	END
	SET @OFFSET = (@Page-1)*@PageSize;

	CREATE TABLE #UnallocatedPayment  (
		[UnallocatedPaymentId] INT,
		[BankStatementEntryId] INT,
		[UserReference] VARCHAR(250),
		[TransactionDate] Date,
		[StatementDate] Date,
	    [HyphenDateProcessed] Date,
		[HyphenDateReceived] Date,
		[Amount] Decimal(18,2),
		[Status] VARCHAR(250),
		[BankAccountNumber] VARCHAR(50),
		[UserReference1] VARCHAR(250),
		[UserReference2] VARCHAR(250),
		[TransactionType] VARCHAR(100),
		[StatementReference] VARCHAR(250)
	);

    INSERT INTO #UnallocatedPayment EXEC [billing].[GetUnallocatedPayments] @DateType,@DateFrom,@DateTo,@Search, @BankAccNum
	
	
	SELECT @TotalRows = @@ROWCOUNT 
	ALTER TABLE #UnallocatedPayment ADD [RowCount] INT;
	UPDATE #UnallocatedPayment SET [RowCount] = @TotalRows

	SET @Query = N'SELECT [UnallocatedPaymentId],
						[BankStatementEntryId],
						[UserReference],
						[TransactionDate],
						[StatementDate],
						[HyphenDateProcessed],
						[HyphenDateReceived],
						[Amount],
						[Status],
						[BankAccountNumber],
						[UserReference1],
						[UserReference2],
						[TransactionType],
						[StatementReference],
						[RowCount]
					 FROM #UnallocatedPayment
					 GROUP BY [UnallocatedPaymentId],
						[BankStatementEntryId],
						[UserReference],
						[TransactionDate],
						[StatementDate],
						[HyphenDateProcessed],
						[HyphenDateReceived],
						[Amount],
						[Status],
						[BankAccountNumber],
						[UserReference1],
						[UserReference2],
						[TransactionType],
						[StatementReference],
						[RowCount]
						ORDER BY ' + @OrderBy + CASE WHEN @isAscending = 1 THEN ' ASC' ELSE ' DESC ' END +
						' OFFSET '+ CONVERT (VARCHAR,@OFFSET) + ' ROWS FETCH NEXT ' +CONVERT (VARCHAR, @PageSize)+ ' ROWS ONLY'
	 EXEC(@Query)

	 DROP TABLE #UnallocatedPayment
	END
GO