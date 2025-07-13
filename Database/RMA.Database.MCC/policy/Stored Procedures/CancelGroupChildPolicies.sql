CREATE PROCEDURE [policy].[CancelGroupChildPolicies]
	@parentPolicyId int,
	@userId varchar(100),
	@cancelDate datetime,
	@cancelReason int
AS BEGIN

	UPDATE policy.Policy
	SET CancellationInitiatedBy = @userId,
		CancellationInitiatedDate = GETDATE(),
		PolicyStatusId = 10, --Pending Cancellation
		CancellationDate = @cancelDate,
		PolicyCancelReasonId = @cancelReason
	WHERE ParentPolicyId = @parentPolicyId
	  AND PolicyStatusId not in (2, 10)

END

