CREATE FUNCTION [security].[fnUserTenantMap] 
   (  
		@UserId int
   ) 
   RETURNS @UserTenantMap TABLE 
      (
         [TenantId] int 
      ) 
AS 
BEGIN 
	DECLARE @RoleId int,@TenantId int, 
			@MultiTenantOverridePermission int = 666, @AdminRoleId int = 1; 

	select TOP 1 @UserId = Id, @TenantId = TenantId, @RoleId = RoleId 
	FROM [security].[User] (NOLOCK) where Id = @UserId;

	IF (SELECT count(1) FROM [security].[UserPermission] (NOLOCK) WHERE UserId = @UserId and PermissionId = @MultiTenantOverridePermission and @AdminRoleId = @RoleId ) > 0
	BEGIN
		insert @UserTenantMap
		SELECT Id from [security].Tenant (NOLOCK);
		RETURN
	END

	insert @UserTenantMap
	SELECT DISTINCT tenantMap.TenantId from (
	select TenantId from [security].[User] (NOLOCK) where Id = @UserId
	union all
	select umap.TenantId from security.UserTenantMap (NOLOCK) umap
	inner join [security].[User] (NOLOCK) sec on sec.Id = umap.UserId
	where Id = @UserId ) tenantMap 
	RETURN       
END
