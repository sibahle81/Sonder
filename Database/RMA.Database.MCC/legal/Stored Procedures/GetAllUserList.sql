
CREATE   Procedure  [legal].[getAllUserList] 
As 
Begin
select   
distinct [security].[User].Email,
[security].[User].DisplayName, 
[security].[User].Id, 
[security].[User].UserName 
from [security].[User] 
inner join  [security].[Role] on [security].[Role].Id =[security].[User] .RoleId 
Inner Join [security].[RolePermission] on [security].[RolePermission].RoleId = [security].[Role].Id 
Inner Join [security].[Permission] on [security].[Permission].Id = [security].[RolePermission].PermissionId 
Inner Join [security].[PermissionGroup] on [security].[PermissionGroup].Id = [security].[Permission].PermissionGroupId 
Inner Join [Common].[Module] on [Common].[Module].id= [security].[PermissionGroup].ModuleId 
where [security].[User].IsDeleted = 0 and  [security].[User].IsActive  = 1
order by [security].[User].DisplayName
End
--exec [legal].[GetAllUserList] 