 CREATE PROCEDURE [billing].[DebtorsReport]
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
			@MINYEARMONTH INT,
			@ORIGMINYEAR INT,
			@EndMonth INT
			--@StartDate AS DATE,
			--@EndDate AS DATE

			--SET @StartDate='2022-01-01'
			--SET @EndDate='2022-12-31'

	SET @CurrentMonth =(YEAR(GETDATE()) * 100) + (MONTH(GETDATE()))
	SET @EndMonth = (YEAR(@EndDate) * 100) + (MONTH(@EndDate) * 1)
	SET @StartMonth =(YEAR(@StartDate) * 100) + (MONTH(@StartDate) * 1)
	SET @YearToDateMonth = (LEFT(@CurrentMonth,4) * 100) + (1)
	SET @YearToDate = (DATEADD(yy, DATEDIFF(yy, 0, GETDATE()), 0))
	SET @PrevMonth = (YEAR(GETDATE()) * 100) + (MONTH(GETDATE())-1)
	SET @CurrentDay =(GETDATE())

	
	

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
		WHERE --(t.[TransactionDate] BETWEEN @YearToDate AND @CurrentDay)
		--AND  
		(
				(t.TransactionTypeId = 4 AND NOT EXISTS 
					(SELECT * FROM billing.Transactions WHERE TransactionTypeId = 2 AND LinkedTransactionId = t.TransactionId)
				 OR (t.TransactionTypeId = 3 AND NOT EXISTS 
						(SELECT * FROM billing.Transactions WHERE TransactionTypeId = 1 AND LinkedTransactionId = t.TransactionId)
				 OR (t.TransactionTypeId = 6 AND NOT EXISTS 
						(SELECT * FROM billing.Transactions WHERE TransactionTypeId = 5 AND LinkedTransactionId = t.TransactionId)))
				)
			)
			
			

	--1.2 [billing].[FinalTransactions]
		IF OBJECT_ID(N'tempdb..#TempFinalbillingTransactions', N'U') IS NOT NULL
			DROP TABLE #TempFinalbillingTransactions;

		SELECT	icd.[Name] as IndustryClass,
			pp.[Name] AS [ProductType],
			(YEAR(t.[TransactionDate]) * 10000) + (MONTH(t.[TransactionDate]) * 100) + (DAY(t.[TransactionDate]) * 1) AS [TransactionDate],
			t.[TransactionMonth],
			tt.[Name] AS [TransactionTypeName],
			CASE WHEN (tt.[Name] IN ('Credit Note','Payment')) THEN ISNULL((SUM(t.[Amount]) * -1),0) ELSE  ISNULL(SUM(t.[Amount]),0) END AS [Amount],
			ISNULL(SUM(ytd.Balance),0) AS OpeningBalance,
			ISNULL(SUM(p.[AnnualPremium]),0) AS [AnnualPremium],
			CASE WHEN (tt.[Name] ='Invoice') THEN ISNULL(SUM(t.[Amount]),0) END AS [InstallmentPremium]
			
				
		INTO #TempFinalbillingTransactions --select distinct t.[TransactionTypeID]--	select count(*)
		FROM #TempbillingTransactions t
		LEFT JOIN [billing].[Invoice] I ON t.InvoiceId = i.InvoiceId
		INNER JOIN [common].[TransactionType] tt ON (t.[TransactionTypeID] = tt.[Id])
		INNER JOIN [billing].[TransactionTypeLink] ttl ON (t.[TransactionTypeLinkId] = ttl.[Id])
		INNER JOIN [policy].[Policy] p ON (t.[RolePlayerID] = P.PolicyOwnerId)
		INNER JOIN [client].[RolePlayer] R ON P.PolicyOwnerId = R.RolePlayerId
		INNER JOIN [product].[ProductOption] ppo ON (p.[ProductOptionId] = ppo.[Id] ) 
		INNER JOIN [product].[Product] pp ON (pp.[Id] = ppo.[productId] ) 
		INNER JOIN [client].[finpayee] f ON r.roleplayerid = f.roleplayerid
		LEFT JOIN  [common].[industry] ic ON ic.id =f.industryid 
		LEFT JOIN [common].[industryclass] icd ON icd.id =ic.industryclassid
		--INNER JOIN [product].[ProductOptionCoverType] poc ON (p.ProductOptionId = poc.ProductOptionId and poc.[CovertypeId] = 1) 
		--INNER JOIN [common].CoverType ct on poc.CoverTypeId = ct.Id
		
		LEFT JOIN (
			select t.TransactionId, dbo.GetTransactionBalance(t.TransactionId) as Balance --,t.TransactionTypeId,t.TransactionDate , ac.StartDate
			FROM [billing].[Transactions] t
			INNER JOIN [policy].[policy] p ON (t.RolePlayerId = p.PolicyOwnerId)
			INNER JOIN (	
						SELECT StartDate
						FROM [common].[Period] p 
						WHERE p.[Status] != 'Future'
						) ac ON (t.TransactionDate = ac.StartDate) 
			WHERE (t.TransactionTypeId  = 6) --AND t.RolePlayerId =2145--t.TransactionId=249
		) ytd ON (t.TransactionId = ytd.TransactionId)
		group by pp.[Name],
				[TransactionMonth],
				t.[TransactionDate],
				tt.[Name],icd.[Name] 


	--FINAL SELECT
	IF OBJECT_ID(N'tempdb..#Temp', N'U') IS NOT NULL
	DROP TABLE #Temp;

	SELECT  a.IndustryClass,
			a.[ProductType],
			a.[TransactionMonth],
			a.[TransactionTypeName],
			[Amount],
			0 AS [YTDAmount],	
			b.[OpeningBalance],
			0 AS [YTDOpeningBalance],
			'SELECTION' AS [Period]
	
	INTO #Temp
	FROM #TempFinalbillingTransactions a
	LEFT JOIN (
				SELECT [ProductType],
						[TransactionTypeName],
						SUM([OpeningBalance]) AS [OpeningBalance]
				FROM #TempFinalbillingTransactions c
				GROUP BY [ProductType],
						[TransactionTypeName]
	) b ON (a.[ProductType] =b.[ProductType]) AND (a.[TransactionTypeName] =b.[TransactionTypeName])


	UNION 

	SELECT
			a.IndustryClass,
			a.[ProductType],
			a.[TransactionMonth],
			a.[TransactionTypeName],
			0 AS [Amount],
			[Amount] AS [YTDAmount],	
			0 AS [OpeningBalance],
			[OpeningBalance] AS [YTDOpeningBalance],
			'YTD' AS [Period]

	FROM #TempFinalbillingTransactions a
	WHERE a.[TransactionMonth] BETWEEN  @YearToDateMonth AND @CurrentMonth
	order by 2,3
	

-- Create temp tables for monthly opening balances

  	IF OBJECT_ID(N'tempdb..#Temp4', N'U') IS NOT NULL
	DROP TABLE #Temp4;

	SET @ORIGMINYEAR =(SELECT(MIN(LEFT(TransactionMonth,4))) FROM #Temp)
	SET @MINYEARMONTH =(SELECT(MIN(LEFT(TransactionMonth,6))) FROM #Temp)

	SELECT  a.TransactionMonth, 
			dbo.GetTransactionBalance((SELECT TOP 1  t2.TransactionId FROM #TempbillingTransactions t2 where t2.TransactionTypeId = 6 order by createddate asc)) as YearlyOpeningBalance,
			sum(a.amount)as MonthSum,
			min(LEFT(a.TransactionMonth,4)) AS StartTransactionYear,
			@ORIGMINYEAR AS OrigMinYear,
			@MINYEARMONTH AS OrigMinYearMonth
	INTO #Temp4
	FROM #Temp a
	GROUP BY TransactionMonth

	

    IF OBJECT_ID(N'tempdb..#Temp5', N'U') IS NOT NULL
	DROP TABLE #Temp5;

	CREATE TABLE #Temp5 ([TransactionMonth] int,[Yearlyopeningbalance] int,[MonthSum] DECIMAL(18,2),OpeningBalance DECIMAL(18,2),StartTransactionYear int);

	 SET @MINYEAR =(SELECT(MIN(LEFT(TransactionMonth,4))) FROM #Temp)

	IF @MINYEAR < YEAR(GETDATE()) 
									

	WHILE ( @MINYEAR <= YEAR(GETDATE()))
		BEGIN
			PRINT @MINYEAR
		INSERT INTO #Temp5([TransactionMonth],[Yearlyopeningbalance],[MonthSum],OpeningBalance,StartTransactionYear)
		SELECT
			[TransactionMonth],
			[Yearlyopeningbalance],
			[MonthSum],
		CASE
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '01' then (Select SUM(MonthSum) from #Temp4 Where StartTransactionYear =  @MINYEAR-1 AND CONVERT(INT,RIGHT(TransactionMonth,2)) <= 12)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '02' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 2 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '03' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 3 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '04' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 4 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '05' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 5 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '06' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 6 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '07' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 7 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '08' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 8 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '09' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 9 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '10' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 10 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '11' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 11 AND @MINYEAR =StartTransactionYear)
			WHEN OrigMinYear = StartTransactionYear and RIGHT(TransactionMonth,2) = '12' then (Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 12 AND @MINYEAR =StartTransactionYear)
		ELSE 
		CASE 
			WHEN RIGHT(TransactionMonth,2) = '01' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  ((@MINYEAR-1) *100) +(12))--Select ISNULL(SUM(MonthSum),0) from #Temp4 Where StartTransactionYear =  @MINYEAR-1 AND CONVERT(INT,RIGHT(TransactionMonth,2)) <= 12)
			WHEN RIGHT(TransactionMonth,2) = '02' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(1))--Where RIGHT(TransactionMonth,2) < 2 AND @MINYEAR =StartTransactionYear)
			WHEN RIGHT(TransactionMonth,2) = '03' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(2))--(Select SUM(MonthSum) from #Temp4 Where RIGHT(TransactionMonth,2) < 3 AND @MINYEAR =StartTransactionYear)
			WHEN RIGHT(TransactionMonth,2) = '04' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(3))
			WHEN RIGHT(TransactionMonth,2) = '05' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(4))
			WHEN RIGHT(TransactionMonth,2) = '06' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(5))
			WHEN RIGHT(TransactionMonth,2) = '07' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(6))
			WHEN RIGHT(TransactionMonth,2) = '08' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(7))
			WHEN RIGHT(TransactionMonth,2) = '09' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(8))
			WHEN RIGHT(TransactionMonth,2) = '10' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(9))
			WHEN RIGHT(TransactionMonth,2) = '11' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(10))
			WHEN RIGHT(TransactionMonth,2) = '12' then (Select ISNULL(SUM(MonthSum),0) from #Temp4 Where TransactionMonth BETWEEN OrigMinYearMonth AND  (@MINYEAR *100) +(11))
		END
		END AS  OpeningBalance, 
			StartTransactionYear
		FROM #Temp4
		WHERE @MINYEAR =StartTransactionYear

		SET @MINYEAR  = @MINYEAR  + 1
	END


	IF OBJECT_ID(N'tempdb..#DebtorFinal', N'U') IS NOT NULL
	DROP TABLE #DebtorFinal;

	 
		SELECT  a.IndustryClass,a.[ProductType],
			a.[TransactionMonth],
			a.[TransactionTypeName],
			SUM(a.[Amount]) AS [Amount],
			SUM(a.[YTDAmount]) AS [YTDAmount],	
			CASE WHEN a.[Period] ='SELECTION' THEN (SELECT SUM(b.[YTDOpeningBalance]) from #Temp b 
													WHERE b.[Period] ='YTD' GROUP BY [Period]) 
			END AS [OpeningBalance],
			SUM(a.[YTDOpeningBalance]) AS [YTDOpeningBalance],
			[Period]
		INTO #DebtorFinal
		FROM #Temp a
		GROUP  BY a.[IndustryClass],
				a.[ProductType],
				a.[TransactionMonth],
				a.[TransactionTypeName],
				a.[Period]

		Update #DebtorFinal
		set [OpeningBalance] = 0
		WHERE TransactionMonth <> @EndMonth
		OR (TransactionMonth = @EndMonth  AND [TransactionTypeName] NOT IN ('Invoice'))



	IF OBJECT_ID(N'tempdb..#DebtorFinal2', N'U') IS NOT NULL
	DROP TABLE #DebtorFinal2;

				SELECT  a.[IndustryClass],a.[ProductType],
				a.[TransactionMonth],
				a.[TransactionTypeName],
				SUM(a.[Amount]) AS [Amount],
				SUM(a.[YTDAmount]) AS [YTDAmount],	
				ISNULL(MIN(b.OpeningBalance),0) AS [OpeningBalance],
				SUM(a.[YTDOpeningBalance]) AS [YTDOpeningBalance],
				[Period]
		INTO #DebtorFinal2
		FROM #Temp a
		LEFT JOIN #Temp5 b ON a.[TransactionMonth] = b.[TransactionMonth] 
		AND (a.[Period] = 'SELECTION')
		AND (a.TransactionTypeName = 'INVOICE')
		GROUP  BY a.[IndustryClass],
				a.[ProductType],
				a.[TransactionMonth],
				a.[TransactionTypeName],
				a.[Period]


		Update #DebtorFinal2
		set [OpeningBalance] = 0
		WHERE TransactionMonth <> @StartMonth
		AND [Period] ='SELECTION'
	
	IF @EndDate = @CurrentDay AND @StartDate = @YearToDate
		SELECT * FROM #DebtorFinal
		ELSE 
		SELECT * FROM #DebtorFinal2
 

END
