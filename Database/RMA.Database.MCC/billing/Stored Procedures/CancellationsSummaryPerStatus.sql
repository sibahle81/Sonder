CREATE PROCEDURE [billing].[CancellationsSummaryPerStatus]
 AS
  BEGIN  
	SELECT
		 [Reason].Name AS [Status],
         COUNT(*) AS [Count],
		 SUM([Policy].AnnualPremium) AS Amount
    FROM [policy].[Policy] [Policy]
		 INNER JOIN [common].PolicyCancelReason [Reason] ON [Reason].Id = [Policy].PolicyCancelReasonId
	WHERE CancellationDate IS NOT NULL AND
		  YEAR(CancellationDate) = YEAR(getdate())AND
		  PolicyStatusId = 2
	GROUP BY [Reason].Name
	ORDER BY [Reason].Name
  END