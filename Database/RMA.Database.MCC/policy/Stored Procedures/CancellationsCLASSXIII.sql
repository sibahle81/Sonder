CREATE PROCEDURE [policy].[CancellationsCLASSXIII]
 AS
  BEGIN  
	SELECT
		 [Reason].Name AS Reason,
         COUNT(*) AS NumberOfPoliciesCancelled,
		 SUM([Policy].AnnualPremium) AS Premium,
		 COUNT([policy].[PolicyInsuredLives].RolePlayerId) AS NumberOfLives
    FROM [policy].[Policy]
		 INNER JOIN [common].PolicyCancelReason [Reason] ON [Reason].Id = [Policy].PolicyCancelReasonId 
		 INNER JOIN [policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].PolicyId =  [policy].[Policy].PolicyId
	WHERE CancellationDate IS NOT NULL AND
		  YEAR(CancellationDate) = YEAR(getdate())AND
		  PolicyStatusId = 2
	GROUP BY [Reason].Name
	ORDER BY [Reason].Name
  END