CREATE PROCEDURE [billing].[PostedGeneralLederReport]
  @StartDate AS DATE = NULL,
  @EndDate AS DATE = NULL,
  @chartNumber AS VARCHAR(50) = NULL
AS BEGIN

	--DECLARE @StartDate AS DATE = '2024-05-01'
	--DECLARE @EndDate AS DATE = '2024-05-31'
	--DECLARE @chartNumber AS VARCHAR(50) = '54006'

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
		   CASE WHEN AC.TransactionType IN ('Invoice','Credit Note','Invoice Reversal') THEN ChartISNo ELSE ChartBSNo END AS ChartISNo,
		   ChartIsName,
		   CASE WHEN AC.TransactionType IN ('Invoice') THEN
		   ISNULL(I.InvoiceNumber, '')
		   WHEN AC.TransactionType NOT IN ('Invoice') THEN
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
	FROM [billing].[AbilityCollections] AC (nolock)
		INNER JOIN [billing].[AbilityTransactionsAudit] AT (nolock) ON AC.Reference = AT.Reference 
		INNER JOIN [billing].[Transactions] T (nolock) ON AT.TransactionId = T.TransactionId 
		INNER JOIN [client].[RolePlayer] R (nolock) ON T.RolePlayerId = R.RolePlayerId 
		INNER JOIN [client].[FinPayee] F (nolock) ON R.RolePlayerId = F.RolePlayerId 
		LEFT JOIN billing.Invoice I (nolock) ON I.InvoiceId = T.InvoiceId 
	WHERE AC.IsBilling = 1
	  AND ((@StartDate IS NULL AND @EndDate IS NULL) OR (T.TransactionDate BETWEEN @StartDate AND @EndDate))

	INSERT INTO @SearchTable
	SELECT DISTINCT
		   CompanyNo,
		   BranchNo,
		   Level1,
		   Level2,
		   YEAR(T.TransactionDate) AS Level3,
		   YEAR(T.TransactionDate) AS [Year],
		   DATENAME(month, T.TransactionDate) AS [Month],
		   CASE WHEN AC.TransactionType IN ('Invoice','Credit Note','Invoice Reversal') THEN ChartBSNo ELSE ChartISNo END AS ChartISNo,
		   ChartIsName,
		   CASE WHEN AC.TransactionType IN ('Invoice') THEN ISNULL(I.InvoiceNumber, '') WHEN AC.TransactionType NOT IN ('Invoice') THEN iif(t.rmareference = '' or t.rmareference is null, t.bankreference, t.rmareference)  END AS ItemReference,
		   0 AS OpeningBalance,
		   AT.Amount AS Amount,
		   T.TransactionDate,
		   T.TransactionDate AS AbilityTransactiondate,
		   AT.Reference AS [Description],
		   '' AS AnalysisNo,
		   T.CreatedBy,
		   AT.Item,
		   'Debtor: ' + F.FinPayeNumber + ' - ' + OnwerDetails AS FullDesc
	FROM [billing].[AbilityCollections] AC (nolock)
		INNER JOIN [billing].[AbilityTransactionsAudit] AT (nolock) ON AC.Reference = AT.Reference 
		INNER JOIN [billing].[Transactions] T (nolock) ON AT.TransactionId = T.TransactionId 
		INNER JOIN [client].[RolePlayer] R (nolock) ON T.RolePlayerId = R.RolePlayerId 
		INNER JOIN [client].[FinPayee] F (nolock) ON R.RolePlayerId = F.RolePlayerId 
		LEFT JOIN [billing].[Invoice] I (nolock) ON I.InvoiceId = T.InvoiceId 
	WHERE AC.[IsBilling] = 1
	  AND ((@StartDate IS NULL AND @EndDate IS NULL) OR (T.TransactionDate BETWEEN @StartDate AND @EndDate))
	  AND AC.TransactionType IN ('Invoice','Credit Note','Invoice Reversal')

	INSERT INTO @SearchTable
	select distinct ap.[CompanyNo],
		   ap.[BranchNo],
		   ap.[Level1],
		   ap.[Level2],
		   YEAR(tx.TransactionDate) AS Level3,
		   YEAR(tx.TransactionDate) AS [Year],
		   DATENAME(month, tx.TransactionDate) AS [Month],
		   ap.ChartBsNo,
		   xr.ChartBsName,
		   tx.[RmaReference] [ItemReference],
		   0 [OpeningBalance],
		   pa.[Amount],
		   tx.TransactionDate,
		   tx.TransactionDate AS AbilityTransactionDate,
		   ap.Reference AS [Description],
		   '' [AnalysisNo],
		   tx.CreatedBy,
		   pt.[Name] Item,
		   concat('Creditor: ', upper(concat(fp.FinPayeNumber, ' ', rp.DisplayName))) [FullDesc]
	from [finance].[AbilityPosting] ap (nolock)
		inner join [finance].[AbilityPostingAudit] pa (nolock) on pa.[Reference] = ap.[Reference]
		inner join [finance].[ProductCrossRefTranType] xr (nolock) on xr.ChartBsNo = ap.ChartBsNo and xr.TransactionType = 'Credit Note' and xr.Origin like '%payback%'
		inner join [payment].[Payment] pay (nolock) on pay.PaymentId = pa.PaymentId
		inner join [common].[PaymentType] pt (nolock) on pt.Id = pay.PaymentTypeId
		inner join [policy].[Policy] p (nolock) on p.PolicyId = pay.PolicyId
		inner join [client].[RolePlayer] rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
		inner join [client].[FinPayee] fp (nolock) on fp.RolePlayerId = rp.RolePlayerId
		inner join [billing].[Transactions] tx (nolock) on 
			tx.RolePlayerId = p.PolicyOwnerId and 
			tx.Amount = pay.Amount and 
			tx.TransactionTypeId = 4 and 
			abs(datediff(minute, tx.CreatedDate, pay.CreatedDate)) < 30 and
			left(tx.Reason, 27) = 'Premium Payback Credit Note'
	where pay.[PaymentTypeId] = 16

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

	WHILE (@StartMonth <= @EndMonth) BEGIN
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
			GROUP BY CompanyNo,BranchNo,ChartISNo
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
			GROUP BY CompanyNo,BranchNo,ChartISNo

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
		LEFT JOIN #OPENINGBAL b ON a.CompanyNo = b.CompanyNo 
			AND a.BranchNo = b.BranchNo 
			AND (YEAR(a.[TransactionDate]) * 100) + (MONTH(a.[TransactionDate])) = b.StartMonth
			AND a.ChartISNo = b.ChartISNo
	WHERE (@chartNumber IS NULL OR (@chartNumber = a.ChartIsNo))
	ORDER BY a.TransactionDate

END
