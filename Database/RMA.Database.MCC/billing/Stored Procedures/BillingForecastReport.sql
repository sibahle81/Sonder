CREATE PROCEDURE [billing].[BillingForecastReport]
	@StartDate AS DATE,
	@EndDate AS DATE

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE @CurrentMonth INT,
			@StartMonth INT,
			@PrevMonth INT,
			@YearToDateMonth INT,
			@YearToDate AS DATE,
			@CurrentDay AS DATE,
			@MINYEAR INT,
			@MinYearMonth INT,
			@ORIGMINYEAR INT,
			@EndMonth INT--,
			--@StartDate AS DATE,
			--@EndDate AS DATE

			--SET @StartDate='2022-02-01'
			--SET @EndDate='2022-04-30'

	SET @CurrentMonth =(YEAR(GETDATE()) * 100) + (MONTH(GETDATE()))
	SET @EndMonth = (YEAR(@EndDate) * 100) + (MONTH(@EndDate) * 1)
	SET @StartMonth =(YEAR(@StartDate) * 100) + (MONTH(@StartDate) * 1)
	SET @YearToDateMonth = (LEFT(@CurrentMonth,4) * 100) + (1)
	SET @YearToDate = (DATEADD(yy, DATEDIFF(yy, 0, GETDATE()), 0))
	SET @PrevMonth = (YEAR(GETDATE()) * 100) + (MONTH(GETDATE())-1)
	SET @CurrentDay =(GETDATE())
	SET @MinYearMonth =(Year(DATEADD(day, -1, convert(date, @StartDate))) *100) + (Month(DATEADD(day, -1, convert(date, @StartDate))) *1)
	

	--1.1 [billing].[Transactions]
		IF OBJECT_ID(N'tempdb..#TempbillingTransactions', N'U') IS NOT NULL
			DROP TABLE #TempbillingTransactions;

		SELECT	

		    t.[TransactionID],
			t.[InvoiceID],		
			t.[RolePlayerID],
			t.[Amount],			
			t.[TransactionDate],
			(YEAR(t.[TransactionDate]) * 100) + (MONTH(t.[TransactionDate])) AS [TransactionMonth],
			t.[BankReference],
			t.[CreatedDate],
			(YEAR(t.[CreatedDate]) * 100) + (MONTH(t.[CreatedDate])) AS [CreatedMonth],
			t.[TransactionTypeID],
			t.[TransactionTypeLinkId]	
				
		INTO #TempbillingTransactions 
		FROM [billing].[Transactions] t
		WHERE
			(
				(t.TransactionTypeId = 4 AND NOT EXISTS 
					(SELECT * FROM billing.Transactions WHERE TransactionTypeId = 2 AND LinkedTransactionId = t.TransactionId)
				 OR (t.TransactionTypeId = 3 AND NOT EXISTS 
						(SELECT * FROM billing.Transactions WHERE TransactionTypeId = 1 AND LinkedTransactionId = t.TransactionId)
				 OR (t.TransactionTypeId = 6 AND NOT EXISTS 
						(SELECT * FROM billing.Transactions WHERE TransactionTypeId = 5 AND LinkedTransactionId = t.TransactionId)))
				)
			)
			
		--Select * from #TempbillingTransactions	

	--1.2 [billing].[FinalTransactions]
		IF OBJECT_ID(N'tempdb..#TempFinalbillingTransactions', N'U') IS NOT NULL
			DROP TABLE #TempFinalbillingTransactions;

		SELECT	
			--pp.[Name] AS [ProductType],
			t.[TransactionMonth],
			tt.[Name] AS [TransactionTypeName],
			CASE WHEN (tt.[Name] IN ('Credit Note','Payment')) THEN ISNULL((SUM(t.[Amount]) * -1),0) ELSE  ISNULL(SUM(t.[Amount]),0) END AS [Amount],
			ISNULL(SUM(p.[AnnualPremium]),0) AS [AnnualPremium],
			--(ISNULL(SUM(p.[InstallmentPremium]),0) *10/100 )+ ISNULL(SUM(p.[InstallmentPremium]),0) AS [ForeCast_Amount],
			CASE WHEN (tt.[Name] ='Invoice') THEN (ISNULL(SUM(t.[Amount]),0) *10/100 ) + ISNULL(SUM(t.[Amount]),0)END AS [ForeCast_Amount],
			CASE WHEN (tt.[Name] ='Invoice') THEN ISNULL(SUM(t.[Amount]),0) END AS [InstallmentPremium]
		
		INTO #TempFinalbillingTransactions	
		FROM #TempbillingTransactions t
		LEFT JOIN [billing].[Invoice] I ON t.InvoiceId = i.InvoiceId
		INNER JOIN [common].[TransactionType] tt ON (t.[TransactionTypeID] = tt.[Id])
		INNER JOIN [billing].[TransactionTypeLink] ttl ON (t.[TransactionTypeLinkId] = ttl.[Id])
		INNER JOIN [policy].[Policy] p ON (t.[RolePlayerID] = P.PolicyOwnerId)
		INNER JOIN [client].[RolePlayer] R ON P.PolicyOwnerId = R.RolePlayerId
		INNER JOIN [product].[ProductOption] ppo ON (p.[ProductOptionId] = ppo.[Id] ) 
		INNER JOIN [product].[Product] pp ON (pp.Id = ppo.ProductId) 

		where t.[TransactionMonth]  BETWEEN @MinYearMonth AND @EndMonth
		and tt.[Name] ='INVOICE'
		group by [TransactionMonth],
				tt.[Name]
		order by [TransactionMonth]

		--Select * from #TempFinalbillingTransactions order by 1


		IF OBJECT_ID(N'tempdb..#TempFinal', N'U') IS NOT NULL
			DROP TABLE #TempFinal;
														
			CREATE TABLE #TempFinal ([TransactionMonth] int,[TransactionTypeName] varchar(32),[Amount] DECIMAL(18,2),[ForeCast_Amount] DECIMAL(18,2),[InstallmentPremium] DECIMAL(18,2),[AnnualPremium] DECIMAL(18,2));


		IF @StartMonth < @EndMonth 
									

		WHILE ( @StartMonth < @EndMonth)
		BEGIN
			PRINT @StartMonth
				  
		IF @StartMonth = @MinYearMonth+1 

		INSERT INTO #TempFinal([TransactionMonth],
		[TransactionTypeName],[Amount],[AnnualPremium],[InstallmentPremium],[ForeCast_Amount])

		Select a.TransactionMonth,a.TransactionTypeName,Sum(a.Amount) as Amount,
		Sum(a.AnnualPremium) as AnnualPremium,Sum(a.InstallmentPremium) as InstallmentPremium,
		--ISNULL(SUM(b.ForeCast_Amount),0) *10/100 + ISNULL(SUM(b.ForeCast_Amount),0) AS [ForeCast_Amount]
		CASE WHEN (a.TransactionMonth = b.TransactionMonth + 1) 
			 --THEN ISNULL(SUM(b.ForeCast_Amount),0) *10/100 + ISNULL(SUM(b.ForeCast_Amount),0) 
			 THEN SUM(b.ForeCast_Amount) ELSE 0 END AS [ForeCast_Amount]

		from #TempFinalbillingTransactions a
		Left join  #TempFinalbillingTransactions b on a.TransactionMonth = b.TransactionMonth + 1
		--Left join #TempFinal c on a.TransactionMonth = c.TransactionMonth
		where a.[TransactionMonth]  = @StartMonth
		group by a.TransactionMonth,a.TransactionTypeName,b.TransactionMonth

		ELSE 

		INSERT INTO #TempFinal([TransactionMonth],
		[TransactionTypeName],[Amount],[AnnualPremium],[InstallmentPremium],[ForeCast_Amount])

		Select a.TransactionMonth,a.TransactionTypeName,Sum(a.Amount) as Amount,
		Sum(a.AnnualPremium) as AnnualPremium,Sum(a.InstallmentPremium) as InstallmentPremium,
		--ISNULL(SUM(b.ForeCast_Amount),0) *10/100 + ISNULL(SUM(b.ForeCast_Amount),0) AS [ForeCast_Amount]
		CASE WHEN (a.TransactionMonth = b.TransactionMonth + 1) 
			 --THEN ISNULL(SUM(b.ForeCast_Amount),0) *10/100 + ISNULL(SUM(b.ForeCast_Amount),0) 
			 THEN ISNULL(SUM(b.ForeCast_Amount),0) *10/100 + ISNULL(SUM(b.ForeCast_Amount),0)
			  ELSE 0 END AS [ForeCast_Amount]

		from #TempFinalbillingTransactions a
		Left join  #TempFinal b on a.TransactionMonth = b.TransactionMonth + 1
		--Left join #TempFinal c on a.TransactionMonth = c.TransactionMonth
		where a.[TransactionMonth]  = @StartMonth
		group by a.TransactionMonth,a.TransactionTypeName,b.TransactionMonth
		
		SET @StartMonth  = @StartMonth  + 1
		
	END
select distinct * from  #TempFinal order by 1
	
	
END