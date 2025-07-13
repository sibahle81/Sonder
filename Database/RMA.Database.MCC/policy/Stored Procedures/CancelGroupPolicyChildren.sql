
-- =============================================================================
-- JP Kruger
-- Cancelling child policies for a group times out in EF, moving to stored proc.
-- =============================================================================

CREATE PROCEDURE [policy].[CancelGroupPolicyChildren]
	@policyId int,
	@userId varchar(100),
	@cancelDate datetime,
	@cancelReason int
AS
BEGIN
	
	DECLARE @parentStatus int
	
	SELECT @parentStatus = PolicyStatusId
	FROM policy.Policy 
	WHERE PolicyId = @policyId

	IF (@parentStatus = 19) -- everything is cancelled
	BEGIN
		UPDATE policy.Policy
		SET CancellationInitiatedBy = @userId,
			CancellationInitiatedDate = GETDATE(),
			PolicyStatusId = 10, --Pending Cancellation
			CancellationDate = @cancelDate,
			PolicyCancelReasonId = @cancelReason
		WHERE PolicyId = @policyId

		UPDATE policy.Policy
		SET CancellationInitiatedBy = @userId,
			CancellationInitiatedDate = GETDATE(),
			PolicyStatusId = 10, --Pending Cancellation
			CancellationDate = @cancelDate,
			PolicyCancelReasonId = @cancelReason
		WHERE ParentPolicyId = @policyId

	END 
	ELSE
	BEGIN
		UPDATE policy.Policy
		SET CancellationInitiatedBy = @userId,
			CancellationInitiatedDate = GETDATE(),
			PolicyStatusId = 10, --Pending Cancellation
			CancellationDate = @cancelDate,
			PolicyCancelReasonId = @cancelReason
		WHERE ParentPolicyId = @policyId
		  AND PolicyStatusId = 19
	END
END