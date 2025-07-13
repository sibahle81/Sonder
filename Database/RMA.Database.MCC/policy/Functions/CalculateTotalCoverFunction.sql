CREATE FUNCTION [policy].CalculatTotalPolicyCover
(
	@policyID int
)
RETURNS int
AS BEGIN
 declare @sum int
 select distinct @sum  = sum(pil.CoverAmount)
			from policy.Policy  pp WITH (NOLOCK)
			inner join [policy].PolicyInsuredLives pil WITH (NOLOCK) on pp.PolicyId = pil.PolicyId
			where pp.PolicyId = @policyID 			
 	return @sum
	END


