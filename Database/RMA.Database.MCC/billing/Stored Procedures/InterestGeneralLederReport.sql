


/****** Object:  StoredProcedure [billing].[PostedGeneralLederReport]    Script Date: 2020/10/26 12:54:11 PM ******/
--SET ANSI_NULLS ON
--GO

--SET QUOTED_IDENTIFIER ON
--GO

------ =============================================
------ Author:		Mbali Mkhize
------ Create date: 07/03/2022
------ EXEC [billing].[InterestGeneralLederReport] '2022-01-01', '2022-03-30',0,'All', NULL
------ =============================================
 CREATE  PROCEDURE [billing].[InterestGeneralLederReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL,
	@IndustryId int,
	@ProductName VARCHAR(50),
	@PolicyNumber AS VARCHAR(50)
AS

BEGIN
 IF @IndustryId = 0
	 BEGIN SELECT @IndustryId = NULL;
	 END

 IF @ProductName = 'All' 
	 BEGIN SELECT @ProductName = NULL;
	 END

 IF @PolicyNumber = ''
	 BEGIN SELECT @PolicyNumber = NULL;
	 END

DECLARE @OpeningBalMonth INT
DECLARE @MinBalMonth INT
DECLARE @StartMonth INT
DECLARE @EndMonth INT

SET @OpeningBalMonth =(YEAR(@StartDate) * 100) + (MONTH(@StartDate)-1)

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
 
  
 INSERT INTO @SearchTable
SELECT DISTINCT
	   CompanyNo,
       BranchNo,
	   Level1,
	   Level2,
	   YEAR(T.TransactionDate) AS Level3,
       YEAR(T.TransactionDate) AS [Year],
	   DATENAME(month, T.TransactionDate) AS [Month],
	   CASE WHEN AC.TransactionType IN ('Interest','Interest Reversal') THEN ChartISNo ELSE ChartBSNo END AS ChartISNo,
	   ChartIsName,
	   CASE WHEN AC.TransactionType IN ('Interest') THEN
	   ISNULL(I.InvoiceNumber, '')
	   WHEN AC.TransactionType NOT IN ('Interest') THEN
	   iif(t.rmareference = '' or t.rmareference is null, t.bankreference, t.rmareference)  END AS ItemReference,
	   0 AS OpeningBalance,
	   AT.Amount AS Amount,
	   T.TransactionDate,
	   T.TransactionDate AS AbilityTransactiondate,
	   AT.Reference AS [Description],
	   '' AS AnalysisNo,
	   T.CreatedBy,
	   AT.Item,
	   'Debtor: ' + F.FinPayeNumber + ' - ' + OnwerDetails AS FullDesc
FROM [billing].[AbilityCollections] AC 
INNER JOIN [billing].[AbilityTransactionsAudit] AT (NOLOCK)
ON AC.Reference = AT.Reference INNER JOIN [billing].[Transactions] T (NOLOCK)
ON AT.TransactionId = T.TransactionId INNER JOIN [client].[RolePlayer] R (NOLOCK)
ON T.RolePlayerId = R.RolePlayerId INNER JOIN [client].[FinPayee] F (NOLOCK)
ON R.RolePlayerId = F.RolePlayerId LEFT JOIN [billing].[Invoice] I (NOLOCK)
ON I.InvoiceId = T.InvoiceId LEFT JOIN [common].[Industry] IND (NOLOCK)
ON IND.Id = F.IndustryId LEFT JOIN [common].[IndustryClass] IC (NOLOCK)
ON IC.Id = IND.IndustryClassId INNER JOIN [policy].[policy] P (NOLOCK)
ON R.RolePlayerId = P.PolicyOwnerId INNER JOIN [product].ProductOption PPO (NOLOCK) 
ON P.ProductOptionId = PPO.Id LEFT JOIN [product].[product] prod (NOLOCK) 
ON ppo.ProductId = prod.Id
 
WHERE AC.IsBilling = 1
AND ((@StartDate IS NULL AND @EndDate IS NULL) OR (T.TransactionDate BETWEEN @StartDate AND @EndDate))
AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
		WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
		AND ind.[Id] = ISNULL(F.IndustryId, ind.[Id]))
AND (prod.[Name] = @ProductName OR @ProductName IS NULL)
AND (P.PolicyNumber = @PolicyNumber or @PolicyNumber IS NULL)
AND (T.TransactionTypeId= 7)
       

IF OBJECT_ID(N'tempdb..#TempSearch', N'U') IS NOT NULL
	DROP TABLE #TempSearch;

 SELECT DISTINCT  CompanyNo,
		BranchNo,
        Level1,
		Level2,
		Level3,
		[Year],
		[Month],
		ChartISNo,
		ChartIsName,
		ItemReference,
		OpeningBalance,
		Amount,
		TransactionDate,
		AbilityTransactiondate,
		[Description],
		AnalysisNo,
		ModifiedBy,
		Item,
		FullDesc
  INTO #TempSearch
  FROM @SearchTable

  IF OBJECT_ID(N'tempdb..#OPENINGBAL', N'U') IS NOT NULL
	DROP TABLE #OPENINGBAL;

	CREATE TABLE #OPENINGBAL ([CompanyNo] int,[BranchNo] int,[ChartISNo] int,OpeningBalance DECIMAL(18,2),StartMonth int)--,TransactionMonth char(15));

	SET @MinBalMonth = (SELECT MIN((YEAR([TransactionDate]) * 100) + (MONTH([TransactionDate]))) FROM #TempSearch)
	SET @StartMonth =(YEAR(@StartDate) * 100) + (MONTH(@StartDate) * 1)
	SET @EndMonth =(YEAR(@EndDate) * 100) + (MONTH(@EndDate) * 1)
	
	IF @StartMonth <= @EndMonth 

	WHILE ( @StartMonth <= @EndMonth)
	BEGIN
		PRINT @StartMonth
	SET @OpeningBalMonth =@StartMonth -1

	IF @MinBalMonth = @StartMonth
	INSERT INTO #OPENINGBAL ([CompanyNo],[BranchNo],[ChartISNo],[OpeningBalance],StartMonth)
	 SELECT  
		CompanyNo,
        BranchNo,
		ChartISNo,
		Sum(Amount) AS OpeningBalance,
		@StartMonth AS StartMonth
	  FROM #TempSearch 
	  WHERE ((YEAR([TransactionDate]) * 100) + (MONTH([TransactionDate])) <= @OpeningBalMonth)
	  Group by CompanyNo,BranchNo,ChartISNo

	ELSE

	INSERT INTO #OPENINGBAL ([CompanyNo],[BranchNo],[ChartISNo],[OpeningBalance],StartMonth)
    SELECT  
		CompanyNo,
        BranchNo,
		ChartISNo,
		Sum(Amount) AS OpeningBalance,
		@StartMonth AS StartMonth
	  FROM #TempSearch 
	  WHERE (((YEAR([TransactionDate]) * 100) + (MONTH([TransactionDate])) = @MinBalMonth)
	  OR ((YEAR([TransactionDate]) * 100) + (MONTH([TransactionDate])) <= @OpeningBalMonth))
	  Group by CompanyNo,BranchNo,ChartISNo

	SET @StartMonth  = @StartMonth  + 1
	END

	  SELECT a.CompanyNo,
		a.BranchNo,
        a.Level1,
		a.Level2,
		a.Level3,
		a.[Year],
		a.[Month],
		a.ChartISNo,
		a.ChartIsName,
		a.ItemReference,
		ISNULL(b.OpeningBalance,0) AS OpeningBalance,
		a.Amount,
		a.TransactionDate,
		a.AbilityTransactiondate,
		a.[Description],
		a.AnalysisNo,
		a.ModifiedBy,
		a.Item,
		a.FullDesc 
  FROM @SearchTable a 
  LEFT JOIN #OPENINGBAL b ON a.CompanyNo = b.CompanyNo AND a.BranchNo =b.BranchNo AND (YEAR(a.[TransactionDate]) * 100) + (MONTH(a.[TransactionDate])) = b.StartMonth
  AND a.ChartISNo =b.ChartISNo
  --WHERE (@chartNumber IS NULL OR (@chartNumber = a.ChartIsNo))
END