CREATE PROCEDURE [billing].[CancellationsSummaryPerMonth]
 AS
  BEGIN  
	SELECT 
		 YEAR(CancellationDate) as [Year],
         MONTH(CancellationDate) as [Month],
         COUNT(*) AS [Count]
    FROM 
		[policy].[Policy]
	WHERE 
	  CancellationDate IS NOT NULL AND
	  YEAR(CancellationDate) BETWEEN (YEAR(getdate())-5) AND YEAR(getdate()) AND
	  PolicyStatusId = 2
	GROUP BY YEAR(CancellationDate), MONTH(CancellationDate)
	ORDER BY YEAR(CancellationDate), MONTH(CancellationDate)
  END