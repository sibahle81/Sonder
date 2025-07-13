
-- =============================================
-- Author:	Lucky Khoza
-- Create date: 2024-08-14
-- EXEC [claim].[GetPartialClaimDetailReport] @ClaimId = 1685889
-- =============================================
CREATE PROCEDURE [claim].[GetPartialClaimDetailReport]
	@ClaimId INT
AS
BEGIN	
	SELECT 
		c.PersonEventId AS ClaimNumber, 
		p.PolicyNumber, 
		CONCAT(FirstName, ' ', Surname) AS [Name], 
		CONVERT(VARCHAR, GETDATE(), 106)AS CurrentDate
	FROM claim.Claim AS c WITH (NOLOCK)
		INNER JOIN [policy].[Policy] AS p WITH (NOLOCK) ON c.PolicyId = p.PolicyId
		INNER JOIN [client].[Person] AS per WITH (NOLOCK) ON p.PolicyOwnerId = per.RolePlayerId
	WHERE c.claimId = @ClaimId
END
GO