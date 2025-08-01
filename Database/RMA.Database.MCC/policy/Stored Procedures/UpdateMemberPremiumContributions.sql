CREATE PROCEDURE [policy].[UpdateMemberPremiumContributions]
	@policyId int,
	@rolePlayerId int,
	@calculationDate date
AS BEGIN

	declare @userId varchar(16) = 'BackendProcess'
	declare @childPolicy bit = 0

	-- Make sure the roleplayer is not active on the policy so that they will be excluded from the calculation
	update policy.PolicyInsuredLives set 
		InsuredLifeStatusId = 2,
		InsuredLifeRemovalReasonId = 3,
		EndDate = cast(getdate() as date),
		ModifiedBy = @userId,
		ModifiedDate = getdate()
	where PolicyId = @policyId
	  and RolePlayerId = @rolePlayerId
	  and InsuredLifeStatusId = 1

	-- Get the parent policyId
	declare @parentPolicyId int
	select @parentPolicyId = ParentPolicyId from policy.Policy where PolicyId = @policyId

	if isnull(@parentPolicyId, 0) > 0 begin
		-- Just update the parent policy's premiums, which will also recalculate the specified policy
		exec policy.UpdateChildPolicyPremiums @parentPolicyId, @userId
	end else if exists (select * from policy.PolicyInsuredLives (nolock) where PolicyId = @policyId and isnull(Premium, 0) > 0) begin
		-- Update using premiums read from policy insured lives table
		exec policy.UpdateConsolidatedFuneralPremium @policyId, @userId
	end else begin
		-- Update individual policy premiums
		exec policy.UpdateIndividualPolicyPremium @policyId, @userId
	end

END

