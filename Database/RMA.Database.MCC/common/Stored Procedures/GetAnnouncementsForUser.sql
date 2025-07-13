CREATE PROCEDURE [common].[GetAnnouncementsForUser]
(
@UserId INT
)
AS
BEGIN

	DECLARE @RoleId int	
	SELECT @RoleId = RoleId FROM [security].[User] WHERE Id = @UserId
	
	SELECT * FROM [common].[Announcement]
	WHERE IsDeleted = 0
	AND GETDATE() BETWEEN StartDate AND EndDate
	AND (IncludeAllRoles = 1 
	OR (IncludeAllRoles = 0 AND AnnouncementId in (SELECT AnnouncementId FROM [common].[AnnouncementRole] WHERE RoleId = @RoleId AND IsDeleted = 0)))
	AND AnnouncementId NOT IN (SELECT AnnouncementId FROM [common].[AnnouncementUserAcceptance] WHERE UserId = @UserId and IsAccepted = 1 AND IsDeleted = 0)
	ORDER BY PriorityId, StartDate

END
GO

