CREATE PROCEDURE [policy].[CreatePolicyNote] 
(
	@policyId INT, 
	@text VARCHAR(MAX),
	@userId VARCHAR(50)
)
AS BEGIN
	SET NOCOUNT ON
	DECLARE @CreatedDate DATETIME = GETDATE()

	BEGIN TRAN trxCreatePolicyNote
	BEGIN TRY

		INSERT INTO [policy].[PolicyNote](PolicyId, [Text], IsDeleted, CreatedBy, CreatedDate,ModifiedBy, ModifiedDate)
		VALUES(@policyId, @text,0, @userId, @CreatedDate ,@userId,@CreatedDate)

		COMMIT TRAN trxCreatePolicyNote
	END TRY
	BEGIN CATCH
		rollback tran trxCreatePolicyNote
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	END CATCH

	SET NOCOUNT OFF
END