CREATE FUNCTION [commission].[GetYoungestChildDOB] (@policyId INT)
RETURNS DATE
AS
BEGIN
    DECLARE @OldestChildDOB DATE;
    
    SELECT TOP 1 @OldestChildDOB = cp.DateOfBirth
    FROM policy.Policy pp (NOLOCK)
    INNER JOIN policy.PolicyLifeExtension ple (NOLOCK) ON ple.PolicyId = pp.PolicyId 
    INNER JOIN policy.PolicyInsuredLives pil (NOLOCK) ON pil.PolicyId = pp.PolicyId
    INNER JOIN [client].[Person] cp (NOLOCK) ON cp.RolePlayerId = pil.RolePlayerId
    WHERE pp.PolicyId = @policyId
    ORDER BY cp.DateOfBirth DESC;
    
    RETURN @OldestChildDOB;
END;
