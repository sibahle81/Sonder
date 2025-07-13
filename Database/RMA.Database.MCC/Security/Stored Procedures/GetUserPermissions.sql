 

CREATE proc [security].[GetUserPermissions]
(@UserId int)
as
begin
--select p.[Name] from [security].[UserPermission] up
--inner join [security].[Permission] p on up.PermissionId = p.Id

select p.[Name] from [security].[User] u
inner join [security].[RolePermission] rp on rp.RoleId = u.RoleId
inner join [security].[Permission] p on p.Id =  rp.PermissionId 
where u.id = @UserId
end