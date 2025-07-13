CREATE PROC security.InsertUpdateUserPermission @UserId INT, @PermissionId INT, @IsActive BIT, @IsDeleted BIT, @ModifiedBy varchar(50)
AS
BEGIN
		IF EXISTS( SELECT 1 FROM [security].[UserPermission2] WHERE [UserId] = @UserId AND [PermissionId] = @PermissionId)
		BEGIN
			UPDATE [security].[UserPermission2]
			   SET [IsActive] = @IsActive
				  ,[IsDeleted] = @IsDeleted
				  ,[ModifiedBy] = @ModifiedBy
				  ,[ModifiedDate] = GETDATE()
			 WHERE [UserId] = @UserId AND [PermissionId] = @PermissionId
		END
		ELSE
		BEGIN
			INSERT INTO [security].[UserPermission2]
           ([UserId]
           ,[PermissionId]
           ,[IsActive]
           ,[IsDeleted]
           ,[ModifiedBy]
           ,[ModifiedDate])
			VALUES
           (@UserId
           ,@PermissionId
           ,@IsActive
           ,@IsDeleted
           ,@ModifiedBy
           ,GETDATE())
		END
 END
GO

