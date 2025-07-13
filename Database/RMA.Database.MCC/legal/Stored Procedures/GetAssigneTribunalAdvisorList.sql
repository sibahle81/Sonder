
CREATE   Procedure [legal].[getAssigneTribunalAdvisorList] 
(
@ModuleId as int,
@PermissionGroupId as int
)
As 
Begin

select   
distinct [security].[User].Id, 
[security].[User].DisplayName, 
[security].[User].UserName,
[security].[User].Email 
from [security].[User] 
inner join  [security].[Role] on [security].[Role].Id =[security].[User] .RoleId 
Inner Join [security].[RolePermission] on [security].[RolePermission].RoleId = [security].[Role].Id 
Inner Join [security].[Permission] on [security].[Permission].Id = [security].[RolePermission].PermissionId 
Inner Join [security].[PermissionGroup] on [security].[PermissionGroup].Id = [security].[Permission].PermissionGroupId 
Inner Join [Common].[Module] on [Common].[Module].id= [security].[PermissionGroup].ModuleId 
where [security].[User].IsDeleted = 0 and [Common].[Module].Name in ('LegalCare') 
and [security].[User].IsDeleted=0 
AND [security].[Role].Name in ('Tribunal Legal Advisor')
and [security].[PermissionGroup].ModuleId= @ModuleId
End

--exec [legal].[GetAssigneTribunalAdvisorList]  10 ,10   --@ModuleId as int, @PermissionGroupId as int