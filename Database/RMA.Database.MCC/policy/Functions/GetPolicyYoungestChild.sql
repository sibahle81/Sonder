CREATE  FUNCTION [policy].[GetPolicyYoungestChild](@policyId int)
    RETURNS Datetime AS
    BEGIN
        RETURN (select top 1 cp.DateOfBirth
			from policy.Policy (NOLOCK) pp 
			inner join policy.PolicyInsuredLives (NOLOCK) pil on pil.PolicyId = pp.PolicyId
			inner join [client].[RolePlayerType] (NOLOCK) crt on crt.RolePlayerTypeId = pil.RolePlayerTypeId
			inner join [client].[Person] (NOLOCK) cp on cp.RolePlayerId = pil.RolePlayerId
			where pp.PolicyId = @policyId and crt.[Name] = 'Child' order by Datediff(year,cp.DateOfBirth,GETDATE()) desc  )
    END