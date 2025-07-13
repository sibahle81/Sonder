


-- =============================================
-- Author:		Gram Letoaba
-- Create date: 03/09/2020
-- EXEC [billing].[ConsolidatedPostingsReport] NULL, NULL
-- =============================================
CREATE   PROCEDURE [billing].[ConsolidatedPostingsReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL
AS
BEGIN
     
	 DECLARE @ResultTable TABLE (
	     [TransactionType] VarChar(100),
		 [Reference] VarChar(100),
		 [DailyTotal] DECIMAL(18,2),
		 [CompanyNo] INT,
		 [BranchNo] INT,
		 [Product] VarChar(100),
		 [TransactionStatus] DECIMAL(18,2),
		 [Description] VarChar(100),
		 [Variance] DECIMAL(18,2)
	 )
	 INSERT INTO @ResultTable
	 SELECT [TransactionType],
         [Reference],
		 CASE WHEN TransactionType IN ('Receipts','Credit Note') THEN -[DailyTotal]
	     WHEN TransactionType NOT IN ('Receipts','Credit Note') THEN [DailyTotal] END AS [DailyTotal],
		 [CompanyNo],
         [BranchNo],
		 CASE WHEN [Reference] LIKE '%IND%' THEN 'Funeral - Individual' 
		      WHEN [Reference] LIKE '%GRP%' THEN 'Funeral - Group' 
			  WHEN [Reference] LIKE '%MTL%' THEN 'Funeral - Metals' 
			  WHEN [Reference] LIKE '%MIN%' THEN 'Funeral - Mining' 
		 END AS [Product],
		 CASE WHEN TransactionType IN ('Receipts','Credit Note') THEN -[DailyTotal]
	     WHEN TransactionType NOT IN ('Receipts','Credit Note') THEN [DailyTotal] END AS [TransactionStatus],
		 '' AS [Description],
		 0 AS [Variance]
  FROM [billing].[AbilityCollections]
  WHERE ((@StartDate IS NULL AND @EndDate IS NULL) OR ([TransactionDate] BETWEEN @StartDate AND @EndDate)
          AND [IsProcessed] = 1)

  SELECT * FROM @ResultTable
END
