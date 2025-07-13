CREATE PROCEDURE [billing].[CancellationsSummaryResolved]
 AS
  BEGIN  
	SELECT   
		[Status].Name AS [Status],
		 COUNT(*) AS [Count]
    FROM 
		[policy].[Policy] [Policy]
	INNER JOIN [common].PolicyStatus [Status] ON [Status].Id = [Policy].PolicyStatusId
	WHERE 
		YEAR(CancellationDate) = YEAR(getdate()) AND PolicyStatusId IN (2,10)
	GROUP BY [Status].Name
	ORDER BY [Status].Name
  END