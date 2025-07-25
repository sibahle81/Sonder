-- =============================================
-- Author:		Gram Letoaba
-- Create date: 11/09/2020
-- EXEC [billing].[AbilityPostingReport] NULL, NULL, NULL
-- =============================================
CREATE   PROCEDURE [billing].[AbilityPostingExceptionReport]
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
	   AccountDetails,
	   BankBranch,
	   Amount,
	   AA.CreatedDate,
	   AA.Reference,
	   convert(char(5), AA.CreatedDate, 108) [time]
      FROM [billing].[AbilityCollections] AC INNER JOIN [billing].[AbilityTransactionsAudit] AA
      ON AC.Reference = AA.Reference
	  WHERE ((@StartDate IS NULL AND @EndDate IS NULL) OR (AA.CreatedDate BETWEEN @StartDate AND @EndDate))
	        AND (@chartNumber IS NULL OR (@chartNumber = ChartIsNo OR @chartNumber = ChartBsNo))
			AND (AC.IsProcessed = 1 AND AA.IsProcessed = 0)

END
