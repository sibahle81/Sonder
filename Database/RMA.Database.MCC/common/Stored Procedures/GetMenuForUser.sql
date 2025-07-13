

 

CREATE PROC [common].[GetMenuForUser] (@UserId int)
/*
	EXEC [common].[GetMenuForUser] @UserId = 1182
*/
AS

--Declare @UserId int
--Set @UserId = 5063

BEGIN

	Declare @RoleName varchar(100)
	Select @RoleName = R.Name from Security.[User] U Inner Join Security.[Role] R On U.RoleId = R.Id Where U.Id=@UserID
	--print @RoleName

	IF (@RoleName = 'Member') 
	BEGIN
		select
			distinct men.Id,	men.ModuleId, men.OderIndex, men.Title, men.[Url], men.Api,men.IsActive
			from security.Permission (NOLOCK) perm
			inner join security.PermissionGroup (NOLOCK) pg on pg.Id = perm.PermissionGroupId
			inner join common.Module (NOLOCK) mdl on mdl.Id = pg.ModuleId
			--inner join security.UserPermission (NOLOCK) uperm on uperm.PermissionId = perm.Id
			inner join security.RolePermission (NOLOCK) rperm on rperm.PermissionId = perm.Id
			inner join security.[User] (NOLOCK) u on u.RoleId = rperm.RoleId
			INNER JOIN  common.Menu (NOLOCK) men on men.ModuleId = mdl.Id
			where  u.Id = @UserId  
			and men.IsDeleted = 0
			and perm.IsDeleted = 0
			and pg.IsDeleted = 0
			and mdl.IsDeleted = 0
			and men.IsActive = 1
			and men.Id not in (13)
			--and men.Id in (68)
			and men.Title in ('Member')
		 
	END
	ELSE IF (@RoleName ='Agent')
	BEGIN
	select
			distinct men.Id,	men.ModuleId, men.OderIndex, men.Title, men.[Url], men.Api,men.IsActive
			from security.Permission (NOLOCK) perm
			inner join security.PermissionGroup (NOLOCK) pg on pg.Id = perm.PermissionGroupId
			inner join common.Module (NOLOCK) mdl on mdl.Id = pg.ModuleId
			--inner join security.UserPermission (NOLOCK) uperm on uperm.PermissionId = perm.Id
			inner join security.RolePermission (NOLOCK) rperm on rperm.PermissionId = perm.Id
			inner join security.[User] (NOLOCK) u on u.RoleId = rperm.RoleId
			INNER JOIN  common.Menu (NOLOCK) men on men.ModuleId = mdl.Id
			where  u.Id = @UserId  
			and men.IsDeleted = 0
			and perm.IsDeleted = 0
			and pg.IsDeleted = 0
			and mdl.IsDeleted = 0
			and men.IsActive = 1		 
			and men.Id in (68)
			and men.Title in ('Member')
	END
	ELSE
	BEGIN
		select
			distinct men.Id,	men.ModuleId, men.OderIndex, men.Title, men.[Url], men.Api,men.IsActive
			from security.Permission (NOLOCK) perm
			inner join security.PermissionGroup (NOLOCK) pg on pg.Id = perm.PermissionGroupId
			inner join common.Module (NOLOCK) mdl on mdl.Id = pg.ModuleId
			--inner join security.UserPermission (NOLOCK) uperm on uperm.PermissionId = perm.Id
			inner join security.RolePermission (NOLOCK) rperm on rperm.PermissionId = perm.Id
			inner join security.[User] (NOLOCK) u on u.RoleId = rperm.RoleId
			INNER JOIN  common.Menu (NOLOCK) men on men.ModuleId = mdl.Id
			where  u.Id = @UserId  
			and men.IsDeleted = 0
			and perm.IsDeleted = 0
			and pg.IsDeleted = 0
			and mdl.IsDeleted = 0
			and men.IsActive = 1
			and men.Id not in (13)
	END
END
