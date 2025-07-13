CREATE PROCEDURE [security].[SyncInternalUsersFromCompCare]
AS
BEGIN

	DROP TABLE IF EXISTS [security].#tempUsers;
	DECLARE @User TABLE (Id INT IDENTITY(1,1), UpdatedId INT, InsertedId INT)
	DECLARE @RoleId INT, @PortalTypeId INT, @AuthenticationTypeId INT, @Id INT, @UpdatedId INT, @InsertedId INT,
	@Password VARCHAR(2048), @HashAlgorithm VARCHAR(100), @ServerName VARCHAR(100) = @@SERVERNAME, @ProdServerName VARCHAR(10) = 'AZP'

	BEGIN TRY
		BEGIN TRANSACTION InternalUsersJob	
		
			SELECT @RoleId = Id FROM [security].[Role] WHERE Name = 'Digi Form Viewer'
			SELECT @PortalTypeId = Id FROM [common].[PortalType] WHERE Name = 'HCP'

			IF(CHARINDEX(@ProdServerName, @ServerName) > 0)
			BEGIN
				SELECT @AuthenticationTypeId = Id FROM [common].[AuthenticationType] WHERE Name = 'Active Directory'
				SET @Password = NULL
				SET @HashAlgorithm = NULL
			END
			ELSE
			BEGIN
				SELECT @AuthenticationTypeId = Id FROM [common].[AuthenticationType] WHERE Name = 'Forms Authentication'
				SET @Password = 'uGvX45GKXOd39OR/u8bOwA5qZV2trMUp2AmNHlJTueEJoFF00MtvVVHW6tey68TO3y2DnATgCvkDtRD28eEk9r5I3b+R' --Pa$$w0rd 
				SET @HashAlgorithm = 'SHA512'
			END

			SELECT DISTINCT u.[RMAUserID], 
			u.[Name], 
			u.[Email], 
			u.[UserName], 
			u.[PhoneNo], 
			u.[CellNumber],
			u.[IsActive]
			INTO [security].#tempUsers
			FROM [security].[CompcareUser] u
			INNER JOIN [security].[CompcareUserRole] ur ON u.RMAUserID = ur.RMAUserID
			INNER JOIN [security].[CompcareDepartmentRole] dr ON ur.RoleID = dr.RoleID
			INNER JOIN [security].[CompcareRole] r ON ur.RoleID = r.RoleID
			INNER JOIN [security].[CompcareDepartment] d ON dr.RMADepartmentID = d.RMADepartmentID
			WHERE u.RMAUserId <> 66458 AND u.UserTypeId = 1 AND u.DefaultModuleId NOT IN (1, 5, 8, 6, 9, 10) AND ISNULL(u.IsExternal, 0) = 0 AND u.Email like '%randmutual.co.za' 
			AND ur.IsActive = 1 AND dr.IsActive = 1 AND d.IsActive = 1 AND r.IsActive = 1 AND dr.RMADepartmentID IN (2, 3, 12, 30, 34, 37) AND r.RoleID NOT IN (85, 177, 196)
			ORDER BY u.RMAUserID

			MERGE [security].[User] targetUsers
			USING [security].#tempUsers sourceUsers ON targetUsers.Email = sourceUsers.Email

			WHEN MATCHED AND sourceUsers.IsActive <> targetUsers.IsActive
			THEN UPDATE SET targetUsers.IsActive = sourceUsers.IsActive, ModifiedBy = 'SQL Job', ModifiedDate = getdate()

			WHEN NOT MATCHED BY TARGET AND sourceUsers.IsActive = 1
			THEN 
			INSERT ([TenantId], 
			[RoleId], 
			[AuthenticationTypeId], 
			[Email], 
			[DisplayName], 
			[Password], 
			[Token], 
			[FailedAttemptCount], 
			[FailedAttemptDate], 
			[PortalTypeId], 
			[IsActive], 
			[IsDeleted], 
			[CreatedBy], 
			[CreatedDate], 
			[ModifiedBy], 
			[ModifiedDate], 
			[UserName], 
			[HashAlgorithm], 
			[PasswordChangeDate], 
			[TelNo])
			VALUES (1,
			@RoleId, 
			@AuthenticationTypeId, 
			[Email], 
			[Name], 
			@Password, 
			NULL, 
			0, 
			NULL, 
			@PortalTypeId, 
			[IsActive], 
			0, 
			'SQL Job', 
			getdate(), 
			'SQL Job', 
			getdate(), 
			[UserName], 
			@HashAlgorithm, 
			NULL, 
			CASE WHEN ISNULL([PhoneNo], '') <> '' AND LEN(ISNULL([PhoneNo], '')) <= 15 THEN [PhoneNo] ELSE [CellNumber] END)
		
			OUTPUT DELETED.Id, INSERTED.Id INTO @User;
			
			WHILE EXISTS (SELECT 1 FROM @User)
			BEGIN
				SELECT TOP 1 @Id = Id, @UpdatedId = UpdatedId, @InsertedId = InsertedId FROM @User ORDER BY Id
				IF(ISNULL(@UpdatedId, 0) = 0 AND ISNULL(@InsertedId, 0) > 0)
				BEGIN
					INSERT INTO [security].[UserPermission] 
					SELECT @InsertedId, PermissionId FROM [security].[RolePermission] where RoleId = @RoleId;
				END

				DELETE FROM @User WHERE Id = @Id
			END

		COMMIT TRANSACTION InternalUsersJob 
	END TRY
	BEGIN CATCH
		INSERT INTO [dbo].[Logs] SELECT 'Sync Internal users from CompCare job failed to run', ERROR_MESSAGE(), 'Error', getdate(), NULL, '', 'SQL Job'
		BEGIN
			ROLLBACK TRANSACTION InternalUsersJob 
		END
	END CATCH	

END
