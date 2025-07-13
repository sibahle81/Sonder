CREATE   Procedure [debt].[getAllUserListForUpdateStatus] 
(
	@Email As varchar(150),
	@DepartmentId As int
)
As 
Begin
select   
distinct [security].[User].Email,
[security].[User].DisplayName, 
[security].[User].Id, 
[security].[User].UserName , 
[security].[PermissionGroup].Name  PermissionGroupName,
[security].[Role].Name SecurityRoleName,
[Common].[Module].Name ModuleName,
[security].[Role].Id RoleId
from [security].[User] 
inner join [security].[Role] on [security].[Role].Id =[security].[User] .RoleId 
Inner Join [security].[RolePermission] on [security].[RolePermission].RoleId = [security].[Role].Id 
Inner Join [security].[Permission] on [security].[Permission].Id = [security].[RolePermission].PermissionId 
Inner Join [security].[PermissionGroup] on [security].[PermissionGroup].Id = [security].[Permission].PermissionGroupId 
Inner Join [Common].[Module] on [Common].[Module].id= [security].[PermissionGroup].ModuleId 
where [security].[User].IsDeleted = 0 and  [security].[User].IsActive  = 1  
and [security].[PermissionGroup].ModuleId = case when @DepartmentId =14 then (select Id from [common].Module where IsActive = 1 and IsDeleted = 0 and Name ='LegalCare') 
when @DepartmentId =13  then (select Id from [common].Module where IsActive = 1 and IsDeleted = 0 and Name ='LegalCare') when
@DepartmentId =15  then (select Id from [common].Module where IsActive = 1 and IsDeleted = 0 and Name ='LegalCare' ) 
when @DepartmentId =16  then (select Id from [common].Module where IsActive = 1 and IsDeleted = 0 and Name ='DebtCare') End
 and ((@DepartmentId =13 and [security].[Role].Name in ('Tribunal Legal Advisor','Tribunal Legal Secretary','Recovery Consultant','Tribunal Legal Advisor',
'Collection Legal Admin','Recovery Legal Head','Recovery Admin')) or 
(@DepartmentId =14 and [security].[Role].Name in ('Tribunal Legal Advisor','Tribunal Legal Secretary','Recovery Consultant','Tribunal Legal Advisor',
'Collection Legal Admin','Recovery Legal Head','Recovery Admin')) or
(@DepartmentId =15 and [security].[Role].Name in ('Tribunal Legal Advisor','Tribunal Legal Secretary','Recovery Consultant','Tribunal Legal Advisor',
'Collection Legal Admin','Recovery Legal Head','Recovery Admin')) or 
(@DepartmentId =16 and [security].[Role].Name in ('Debtor Collection Team Leader','Debtor Collection Agent')))
and [security].[User].Email like '%'+ @Email+'%'
and [security].[Role].IsDeleted =0 and [security].[Permission].IsDeleted =0 and [security].[PermissionGroup].IsDeleted =0 and  [Common].[Module].IsDeleted =0
order by [security].[User].DisplayName
End
--exec [debt].[GetAllUserListForUpdateStatus] '',14  --@Email ''  @DepartmentId    14=(TeamLeader) Legal , 13= (Colleagues) Legal, 15=Legal, 16= debtor