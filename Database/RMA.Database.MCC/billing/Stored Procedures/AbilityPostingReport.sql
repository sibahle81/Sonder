


-- =============================================
-- Author:		Gram Letoaba
-- Create date: 11/09/2020
-- EXEC [billing].[AbilityPostingReport] NULL, NULL, NULL
-- =============================================
CREATE   PROCEDURE [billing].[AbilityPostingReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL,
	@chartNumber AS VARCHAR(50) = NULL
AS

BEGIN
      SELECT ChartIsNo,
       ChartIsName,
	   ChartBsNo,
	   ChartBsName,
	   AA.OnwerDetails,
	   Bank,
	   TransactionType,
	   ISNULL(T.RmaReference,T.BankReference) AS AccountDetails,
	   BankBranch,
	   CASE WHEN AC.TransactionType IN ('Receipts','Credit Note') THEN -AA.Amount
	   WHEN AC.TransactionType NOT IN ('Receipts','Credit Note') THEN AA.Amount END AS Amount,
	   T.TransactionDate AS CreatedDate,
	   AA.Reference,
	   convert(char(5), AA.CreatedDate, 108) [time]
      FROM [billing].[AbilityCollections] AC INNER JOIN [billing].[AbilityTransactionsAudit] AA
      ON AC.Reference = AA.Reference INNER JOIN billing.Transactions T ON AA.TransactionId = T.TransactionId
	  WHERE ((@StartDate IS NULL AND @EndDate IS NULL) OR (AA.CreatedDate BETWEEN @StartDate AND @EndDate))
	        AND (@chartNumber IS NULL OR (@chartNumber = ChartIsNo OR @chartNumber = ChartBsNo))
			AND AC.IsBilling = 1

END
