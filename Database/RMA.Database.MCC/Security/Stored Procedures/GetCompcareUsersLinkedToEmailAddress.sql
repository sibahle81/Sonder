CREATE PROCEDURE [security].[GetCompcareUsersLinkedToEmailAddress]
	@Email As VARCHAR(500)
AS
	BEGIN
		SELECT u.RmaUserId [UserId]	, Username	
		FROM [security].[CompcareUser] u
			 (NOLOCK) 
		WHERE
			u.Email = @Email
			AND u.IsActive = 1
	END
GO

