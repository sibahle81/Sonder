-- =============================================
-- Author:Mbali Mkhize
-- Create date: 2020/10/09
-- EXEC [billing].[PremiumDebtorsrReport] '2020-08-01', '2020-08-31'
-- =============================================
CREATE  PROCEDURE [billing].[PremiumDebtorsrReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL
AS
--DECLARE @StartDate AS DATE = NULL--'2020-08-01'
--DECLARE	@EndDate AS DATE = NULL--'2020-08-31'
DECLARE @OpeningBalMonth INT
DECLARE @MinBalMonth INT

SET @OpeningBalMonth =(YEAR(@EndDate) * 100) + (MONTH(@EndDate)-1)

	DECLARE @SearchTable TABLE (
		CompanyNo INT,
		BranchNo INT,
        Level1 VARCHAR(250),
		Level2 VARCHAR(250),
		Level3 INT,
		[Year] INT,
		[Month] VARCHAR(250),
		ChartISNo VARCHAR(250),
		ChartIsName VARCHAR(250),
		ItemReference VARCHAR(250),
		OpeningBalance Decimal(18,2),
		Amount Decimal(18,2),
		TransactionDate Date,
		AbilityTransactiondate Date,
		[Description] VARCHAR(250),
		AnalysisNo VARCHAR(250),
		ModifiedBy VARCHAR(max),
		Item VARCHAR(250),
		FullDesc VARCHAR(250)
	);

BEGIN

	IF OBJECT_ID(N'tempdb..#TempSearch', N'U') IS NOT NULL
		DROP TABLE #TempSearch;

      SELECT DISTINCT
	   CompanyNo,
       BranchNo,
	   Level1,
	   Level2,
	   YEAR(T.TransactionDate) AS Level3,
       YEAR(T.TransactionDate) AS [Year],
	   DATENAME(month, T.TransactionDate) AS [Month],
	   ChartBSNo AS ChartISNo,
	   CASE WHEN AT.Item ='Invoice' THEN I.InvoiceNumber
			ELSE  ISNULL(T.RmaReference,T.BankReference) END AS ItemReference,
	   CASE WHEN AC.TransactionType IN ('Receipts','Credit Note') THEN -AT.Amount
	   WHEN AC.TransactionType NOT IN ('Receipts','Credit Note') THEN AT.Amount END AS Amount,
	   T.TransactionDate,
	   AC.Transactiondate AS AbilityTransactiondate,
	   AT.Reference AS [Description],
	   '' AS AnalysisNo,
	   AC.ModifiedBy,
	   AT.Item,
	   'Debtor: ' + F.FinPayeNumber + ' - ' + OnwerDetails AS FullDesc
INTO #TempSearch
FROM [billing].[AbilityCollections] AC INNER JOIN [billing].[AbilityTransactionsAudit] AT
ON AC.Reference = AT.Reference INNER JOIN [billing].[Transactions] T 
ON AT.TransactionId = T.TransactionId INNER JOIN [client].[RolePlayer] R
ON T.RolePlayerId = R.RolePlayerId INNER JOIN [client].[FinPayee] F
ON R.RolePlayerId = F.RolePlayerId LEFT JOIN [billing].[Invoice] I 
ON t.InvoiceId = i.InvoiceId WHERE AC.IsBilling = 1  --AND AC.TransactionType IN ('Invoice','Credit Note')
AND (ChartBSNo IN ('54005','54006'))

  IF OBJECT_ID(N'tempdb..#OPENINGBAL', N'U') IS NOT NULL
	DROP TABLE #OPENINGBAL;


	SET @MinBalMonth = (SELECT MIN((YEAR([TransactionDate]) * 100) + (MONTH([TransactionDate]))) FROM #TempSearch)

    SELECT  
		CompanyNo,
        BranchNo,
		ChartISNo,
		Sum(Amount) AS OpeningBalance
	  INTO #OPENINGBAL
	  FROM #TempSearch 
	  WHERE (((YEAR([TransactionDate]) * 100) + (MONTH([TransactionDate])) = @MinBalMonth)
	  OR ((YEAR([TransactionDate]) * 100) + (MONTH([TransactionDate])) <= @OpeningBalMonth))
	  Group by CompanyNo,BranchNo,ChartISNo

 INSERT INTO @SearchTable
      SELECT CompanyNo,
       BranchNo,
	   Level1,
	   Level2,
	   YEAR(T.TransactionDate) AS Level3,
       YEAR(T.TransactionDate) AS [Year],
	   DATENAME(month, T.TransactionDate) AS [Month],
	   ChartBSNo AS ChartISNo,
	   ChartIsName,
	   CASE WHEN AT.Item ='Invoice' THEN I.InvoiceNumber
			ELSE  ISNULL(T.RmaReference,T.BankReference) END AS ItemReference,
	   0 AS OpeningBalance,
	   CASE WHEN AC.TransactionType IN ('Receipts','Credit Note') THEN -AT.Amount
	   WHEN AC.TransactionType NOT IN ('Receipts','Credit Note') THEN AT.Amount END AS Amount,
	   T.TransactionDate,
	   AC.TransactionDate AS AbilityTransactiondate,
	   AT.Reference AS [Description],
	   '' AS AnalysisNo,
	   AC.ModifiedBy,
	   AT.Item,
	   'Debtor: ' + F.FinPayeNumber + ' - ' + OnwerDetails AS FullDesc
FROM [billing].[AbilityCollections] AC INNER JOIN [billing].[AbilityTransactionsAudit] AT
ON AC.Reference = AT.Reference INNER JOIN [billing].[Transactions] T 
ON AT.TransactionId = T.TransactionId INNER JOIN [client].[RolePlayer] R
ON T.RolePlayerId = R.RolePlayerId INNER JOIN [client].[FinPayee] F
ON R.RolePlayerId = F.RolePlayerId LEFT JOIN [billing].[Invoice] I 
ON t.InvoiceId = i.InvoiceId WHERE AC.IsBilling = 1
AND (ChartBSNo IN ('54005','54006'))
AND (YEAR(ac.transactiondate) * 100) + (MONTH(ac.transactiondate)) > (YEAR(t.transactiondate) * 100) + (MONTH(t.transactiondate))


	  SELECT DISTINCT  a.CompanyNo,
		a.BranchNo,
        Level1,
		Level2,
		Level3,
		[Year],
		[Month],
		a.ChartISNo,
		ChartIsName,
		ItemReference,
		ISNULL(b.OpeningBalance,0) AS OpeningBalance,
		Amount,
		TransactionDate,
		AbilityTransactiondate,
		[Description],
		AnalysisNo,
		ModifiedBy,
		Item,
		FullDesc
  FROM @SearchTable a
  LEFT JOIN #OPENINGBAL b ON a.ChartISNo =b.ChartISNo
  AND a.BranchNo =b.BranchNo
  and a.CompanyNo =b.CompanyNo
  WHERE ((@StartDate IS NULL AND @EndDate IS NULL) OR (TransactionDate BETWEEN @StartDate AND @EndDate))
	        AND (a.ChartIsNo IN ('54005','54006'))
END
GO


