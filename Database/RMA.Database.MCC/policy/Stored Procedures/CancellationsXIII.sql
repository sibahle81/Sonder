CREATE PROCEDURE [Policy].[CancellationsXIII]
 AS
  BEGIN  
	SELECT
		 [Reason].Name AS [CancelledReason],
         COUNT(*) AS [CancelledPolicies],
		 SUM([Policy].AnnualPremium) AS CancelledPremium,
		 COUNT([policy].[PolicyInsuredLives].RolePlayerId) AS NoOfLives
    FROM [policy].[Policy]
		 INNER JOIN [common].PolicyCancelReason [Reason] ON [Reason].Id = [Policy].PolicyCancelReasonId 
		 INNER JOIN [policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].PolicyId =  [policy].[Policy].PolicyId
	WHERE CancellationDate IS NOT NULL AND
		  YEAR(CancellationDate) = YEAR(getdate())AND
		  PolicyStatusId = 2
	GROUP BY [Reason].Name
	ORDER BY [Reason].Name
  END