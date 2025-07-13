CREATE PROCEDURE [policy].[UpdateChildPolicy] 
(
	@policyId INT, 
	@policyStatusId INT, 
	@lastLapsedDate DATETIME, 
	@lapsedCount INT, 
	@userId VARCHAR(50), 
	@modifiedDate DATETIME
)
AS BEGIN
	SET NOCOUNT ON

	BEGIN TRAN trxUpdateChildPolicy
	BEGIN TRY
		UPDATE [policy].[Policy]
		SET 
			PolicyStatusId  = @policyStatusId,
			LastLapsedDate  = @lastLapsedDate,
			LapsedCount		= @lapsedCount,
			ModifiedBy      = @userId,
			ModifiedDate    = @ModifiedDate
		WHERE 
			PolicyId = @policyId
		AND ParentPolicyId IS NOT NULL
		AND PolicyStatusId = 1
		COMMIT TRAN trxUpdateChildPolicy
	END TRY
	BEGIN CATCH
		rollback tran trxUpdateChildPolicy
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	END CATCH

	SET NOCOUNT OFF
END