
CREATE   Procedure [legal].[getUserListByDepartment] 
(
@DepartmentId as int
)
AS
Begin

select distinct 
[security].[User].Id, 
[security].[User].Email, 
case when  isnull([security].[User].DisplayName,'')='' then [security].[User].UserName  else [security].[User].DisplayName END DisplayName, 
[security].[User].UserName 
from [security].[User] 
inner join [security].[Role] on [security].[Role].Id= [security].[User].RoleId    
inner join  [security].[RolePermission] on [security].[RolePermission].RoleId =[security].[Role].Id 
inner join [security].[Permission] on [security].[Permission].Id = [security].[RolePermission].PermissionId 
inner JOIN [security].[PermissionGroup] on [security].[PermissionGroup].Id = [security].[Permission].PermissionGroupId 
inner JOIN [Common].[Module] on [Common].[Module].Id = [security].[PermissionGroup].ModuleId 
where 
 (@DepartmentId in (15,14,13) and [Common].[Module].Id =10) 
 OR 
  (@DepartmentId in (16)  and [Common].[Module].Id =11)  
  END 
  
--Exec [legal].[GetUserListByDepartment] 15 -- Parameter    @DepartmentId  = 15   (Pass Department Id then get user list in department wise Legal and Debtor module)