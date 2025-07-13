

CREATE   Procedure  [legal].[getUserAccessRoles] 
(
	@Email as VARCHAR(50)
)
As 
Begin

select   
[security].[User].Id, 
[security].[User].RoleId , 
[security].[User].Email , 
[security].[User].DisplayName, 
[security].[User].UserName, 
[security].[User].Password, 
[security].[User].IsActive, 
[security].[Role].Name [RoleName], 
[security].[Role].IsActive, 
[Common].[Module].Name [ModuleName], 
[security].[Permission].Name [PermissionName], 
[security].[Permission].PermissionGroupId, 
[security].[PermissionGroup].Name  [PermissionGroupName], 
[security].[PermissionGroup].ModuleId, 
[Common].[Module].Name [ModuleName] 
from [security].[User] 
inner join  [security].[Role] on [security].[Role].Id =[security].[User] .RoleId 
Inner Join [security].[RolePermission] on [security].[RolePermission].RoleId = [security].[Role].Id 
Inner Join [security].[Permission] on [security].[Permission].Id = [security].[RolePermission].PermissionId 
Inner Join [security].[PermissionGroup] on [security].[PermissionGroup].Id = [security].[Permission].PermissionGroupId 
Inner Join [Common].[Module] on [Common].[Module].id= [security].[PermissionGroup].ModuleId 
where [security].[User].IsDeleted = 0 and [Common].[Module].Name in ('LegalCare','DebtCare','MarketingCare')  
and [security].[User].Email = @Email 
End

--exec [legal].[GetUserAccessRoles] 'MNgongoma@randmutual.co.za'   -- Parameter @Email 