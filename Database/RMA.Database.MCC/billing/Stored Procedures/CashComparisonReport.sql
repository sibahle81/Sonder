CREATE   PROCEDURE [billing].[CashComparisonReport]
    @StartDate AS DATE,
	@EndDate AS DATE,
	@ControlName AS VARCHAR(150)
AS
BEGIN  
	declare @startyear int
	declare @startyear1 int
	declare @startyear2 int
	declare @startyear3 int
	declare @startyear4 int

	set @startyear = year(@startdate)
	set @startyear1 = year(@startdate) +1
	set @startyear2 = year(@startdate) +2
	set @startyear3 = year(@startdate) +3
	set @startyear4 = year(@startdate) +4



	IF OBJECT_ID(N'tempdb..#TempYears', N'U') IS NOT NULL
		        DROP TABLE #TempYears;

		SELECT	@StartYear AS [Years]				
		INTO #TempYears
		UNION ALL
		SELECT @StartYear1 AS [Years]
		UNION ALL
		SELECT @StartYear2 AS [Years]
		UNION ALL
		SELECT @StartYear3 AS [Years]
		UNION ALL
		SELECT @StartYear4 AS [Years]

	IF OBJECT_ID(N'tempdb..#TempMonths', N'U') IS NOT NULL
		        DROP TABLE #TempMonths;

		SELECT	'January' AS [Months]				
		INTO #TempMonths
		UNION ALL
		SELECT 'February' AS [Months]
		UNION ALL
		SELECT 'March' AS [Months]
		UNION ALL
		SELECT 'April' AS [Months]
		UNION ALL
		SELECT 'May' AS [Months]
		UNION ALL
		SELECT 'June' AS [Months]
		UNION ALL
		SELECT 'July' AS [Months]
		UNION ALL
		SELECT 'August' AS [Months]
		UNION ALL
		SELECT 'September' AS [Months]
		UNION ALL
		SELECT 'October' AS [Months]
		UNION ALL
		SELECT 'November' AS [Months]
		UNION ALL
		SELECT 'December' AS [Months]

	IF OBJECT_ID(N'tempdb..#TempYearMonths', N'U') IS NOT NULL
		DROP TABLE #TempYearMonths;

	SELECT *
	INTO #TempYearMonths
	FROM #TempYears CROSS JOIN #TempMonths

	DECLARE @SearchTable TABLE (
	    ControlNumber VARCHAR(250),
		ControlName VARCHAR(250),
		[Year] INT,
		Period INT,
		[Month] VARCHAR(250),
		AccountNumber VARCHAR(250),
		DebtorName VARCHAR(250),
		UnderwritingYear INT,
		ReferenceNumber VARCHAR(250),
		TransactionType VARCHAR(250),
		TransactionDate Date,
		TransactionAmount Decimal(18,2),
	    Id INT
	);

	INSERT INTO @SearchTable
	SELECT DISTINCT
	    CASE WHEN ICD.Id = 4 THEN
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
	  WHEN ICD.Id = 1  THEN 
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
	  WHEN ICD.Id = 2 THEN 
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
	  WHEN ICD.Id in (3,5) THEN 
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
	  END AS ControlNumber
	  , CASE WHEN ICD.Id = 4 THEN
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
	  WHEN ICD.Id = 1 THEN 
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1) 
	  WHEN ICD.Id = 2 THEN 
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2) 
	  WHEN ICD.Id in (3,5) THEN 
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4) 
	  END AS ControlName
	  ,YEAR(T.TransactionDate)
	  ,MONTH(T.TransactionDate)
	  ,DATENAME(month, T.TransactionDate) AS [Month]
	  ,F.FinPayeNumber
	  ,R.DisplayName
	  ,YEAR(I.ModifiedDate)
	  ,T.RmaReference
	  ,'Payment'
	  ,T.ModifiedDate
	  ,CASE When T.[TransactionTypeId] IN (1) then T.Amount *-1 else T.Amount end
	 ,ROW_NUMBER() OVER (ORDER BY T.RmaReference) AS Id 
  FROM [billing].[Transactions] T INNER JOIN [billing].[InvoiceAllocation] I ON T.TransactionId = I.TransactionId
  INNER JOIN [client].[FinPayee] F ON T.RolePlayerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
  INNER JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
  INNER JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
  WHERE T.[TransactionTypeId] IN (3,1) AND (YEAR(T.TransactionDate) BETWEEN @StartYear AND @StartYear4)

	 IF @ControlName IS NOT NULL
	 BEGIN
	  SELECT DISTINCT Id, ControlNumber,
			ControlName,
			tym.[Years] AS [Year],
			CASE WHEN tym.[Months] ='January' THEN 1
				 WHEN tym.[Months] ='February' THEN 2
				 WHEN tym.[Months] ='March' THEN 3
				 WHEN tym.[Months] ='April' THEN 4
				 WHEN tym.[Months] ='May' THEN 5
				 WHEN tym.[Months] ='June' THEN 6
				 WHEN tym.[Months] ='July' THEN 7
				 WHEN tym.[Months] ='August' THEN 8
				 WHEN tym.[Months] ='September' THEN 9
				 WHEN tym.[Months] ='October' THEN 10
				 WHEN tym.[Months] ='November' THEN 11
				 WHEN tym.[Months] ='December' THEN 12 END AS Period,
			tym.[Months] AS [Month],
			SUM(TransactionAmount) AS TransactionAmount,
			SUM (TransactionAmount) OVER (ORDER BY Id) AS RunningBalance
		FROM #TempYearMonths tym
		LEFT JOIN @SearchTable st 
		ON tym.[Years] = st.[Year]
		AND tym.[Months] = st.[Month]
		WHERE ControlName LIKE '%'+@ControlName+'%'
		GROUP BY Id, [Years], Period,[Months], ControlNumber, ControlName, TransactionAmount
	END ELSE
	BEGIN
	 SELECT DISTINCT Id, ControlNumber,
			ControlName,
			tym.[Years] AS [Year],
			CASE WHEN tym.[Months] ='January' THEN 1
				 WHEN tym.[Months] ='February' THEN 2
				 WHEN tym.[Months] ='March' THEN 3
				 WHEN tym.[Months] ='April' THEN 4
				 WHEN tym.[Months] ='May' THEN 5
				 WHEN tym.[Months] ='June' THEN 6
				 WHEN tym.[Months] ='July' THEN 7
				 WHEN tym.[Months] ='August' THEN 8
				 WHEN tym.[Months] ='September' THEN 9
				 WHEN tym.[Months] ='October' THEN 10
				 WHEN tym.[Months] ='November' THEN 11
				 WHEN tym.[Months] ='December' THEN 12 END AS Period,
			tym.[Months] AS [Month],
			ISNULL(SUM(TransactionAmount),0) AS TransactionAmount,
			SUM (TransactionAmount) OVER (ORDER BY Id) AS RunningBalance
		FROM #TempYearMonths tym
		LEFT JOIN @SearchTable st 
		ON tym.[Years] = st.[Year]
		AND tym.[Months] = st.[Month]
		GROUP BY Id, [Years], Period,[Months], ControlNumber, ControlName, TransactionAmount
	END
END
GO


