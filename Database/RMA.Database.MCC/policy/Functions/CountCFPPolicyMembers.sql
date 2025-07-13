CREATE FUNCTION [policy].[CalculateLivesOnPolicy]
(
	@policyID int
)
RETURNS int
AS BEGIN
 declare @numberOflives int
 select @numberOflives  = count(pil.PolicyId)
			from policy.Policy  pp WITH (NOLOCK)
			inner join [policy].PolicyInsuredLives pil WITH (NOLOCK) on pp.PolicyId = pil.PolicyId
			where pp.PolicyId = @policyID 			
 	return @numberOflives
	END

