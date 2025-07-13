CREATE PROCEDURE [billing].[CancellationsSummaryPerYear]
 AS
  BEGIN  
	SELECT 
		 YEAR(CancellationDate) as [Year],
         COUNT(*) AS [Count]
    FROM 
		[policy].[Policy]
	WHERE 
	  CancellationDate IS NOT NULL AND
	  YEAR(CancellationDate) BETWEEN (YEAR(getdate())-5) AND YEAR(getdate()) AND
	  PolicyStatusId = 2
	GROUP BY YEAR(CancellationDate)
	ORDER BY YEAR(CancellationDate)
  END