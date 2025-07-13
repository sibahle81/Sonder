 
-- =============================================================================
-- JP Kruger
-- Cancelling child policies for a group times out in EF, moving to stored proc.
-- This SP will reinstate PolicyStatusId to Active if the wizard was rejected
-- Magic numbers comes from PolicyStatusEnum
-- 19=Request to Cancel
--  1=Active
-- =============================================================================

CREATE PROCEDURE [policy].[GroupPolicyCancellationReject]
	@policyId int 
AS
BEGIN

	UPDATE [Policy].[Policy]
	SET PolicyStatusId = 1 
	WHERE PolicyId = @policyId 
	AND PolicyStatusId = 19

	UPDATE [Policy].[Policy]
	SET PolicyStatusId = 1 
	WHERE ParentPolicyId = @policyId 
	AND PolicyStatusId = 19

END