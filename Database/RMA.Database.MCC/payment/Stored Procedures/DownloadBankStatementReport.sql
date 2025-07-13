
CREATE   PROCEDURE [payment].[DownloadBankStatementReport]
    @StartDate AS DATE =  NULL,
	@EndDate AS DATE = NULL 	
AS
BEGIN
DECLARE @FMTONLY BIT;  
	IF OBJECT_ID(N'tempdb..#TempDestinationTable') IS NOT NULL
	BEGIN
		DROP TABLE #TempDestinationTable
	END
	
	 create table #TempDestinationTable  
	 (  
			[BankStatementEntryId] int,
			[DebitCredit] varchar(1),
			[TransactionType]  varchar(100), 
			[DocumentType]  varchar(100), 
			[UserReference1]  varchar(100), 
			[UserReference2]  varchar(100), 
			[BankAccountNumber]  varchar(100),
			[StatementReference] varchar(100),
			[TransactionDate] Date, 
			[StatementDate] Date, 
			[StatementNumber]  varchar(100), 
			[RecordID] int, 
			[BankAndStatementDate] Date,  
			[StatementLineNumber]  varchar(100),  
			[Proccessed]  varchar(100), 
			[UserReference]  varchar(100), 
			[ClaimCheckReference]  varchar(100),
			[Amount]  money ,
	 )

	SET @StartDate =
		CASE WHEN @StartDate IS NULL THEN  DATEADD(month, DATEDIFF(month, 0, getdate()), 0) END;
	SET @EndDate =
		CASE WHEN @EndDate IS NULL THEN EOMONTH(getdate()) END;
	
		INSERT INTO  #TempDestinationTable
	SELECT 
		[BankStatementEntryId], 
		[DebitCredit], 
		[TransactionType], 
		[DocumentType], 
		[UserReference1], 
		[UserReference2], 
		TRIM(REPLACE([BankAccountNumber], '00000', '')) AS [BankAccountNumber], 
		(SELECT CONCAT([StatementNumber], '/', [StatementLineNumber], ' ', (SELECT FORMAT ([StatementDate], 'dd/MM/yyyy')))) AS [StatementReference],
		[TransactionDate], 
		[StatementDate], 
		[StatementNumber], 
		[RecordID], 
		[BankAndStatementDate],  		
		[StatementLineNumber],  
		[Proccessed], 
		[UserReference], 
		[ClaimCheckReference], 
		(CASE [DebitCredit] 
		WHEN '+' THEN [NettAmount]
		WHEN '-' THEN -[NettAmount]
		ELSE 0 END) AS Amount	
	from [finance].[BankStatementEntry] 
	where [StatementDate] between @StartDate and @EndDate
	order by [BankStatementEntryId], [BankAndStatementDate] asc
	
	select 
		[BankStatementEntryId],[DebitCredit],[Amount], SUM([Amount]) OVER (order by [BankStatementEntryId] asc)  AS Balance, 		
		[TransactionType], [DocumentType], [UserReference1], [UserReference2], [BankAccountNumber],
		[StatementReference],
		[TransactionDate], [StatementDate], [StatementNumber], [RecordID], [BankAndStatementDate],  
		[StatementLineNumber],  [Proccessed], [UserReference], 
		[ClaimCheckReference] 
	from #TempDestinationTable

	
END

-- exec [payment].[DownloadBankStatementReport]