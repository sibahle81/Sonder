CREATE   Procedure [debt].[getDebtorTeamLeaderList] 
As 
Begin

select   
distinct [security].[User].Id, 
[security].[User].Email , 
case when isnull([security].[User].UserName,'') ='' then [security].[User].DisplayName else [security].[User].UserName end UserName 
from [security].[User] 
inner join  [security].[Role] on [security].[Role].Id =[security].[User] .RoleId 
Inner Join [security].[RolePermission] on [security].[RolePermission].RoleId = [security].[Role].Id 
Inner Join [security].[Permission] on [security].[Permission].Id = [security].[RolePermission].PermissionId 
Inner Join [security].[PermissionGroup] on [security].[PermissionGroup].Id = [security].[Permission].PermissionGroupId 
Inner Join [Common].[Module] on [Common].[Module].id= [security].[PermissionGroup].ModuleId 
where [security].[User].IsDeleted = 0 and [Common].[Module].Name in ('LegalCare','DebtCare','MarketingCare')  
and [security].[PermissionGroup].Name ='DebtorTeamLeader'
and [security].[User].IsDeleted = 0 
End

--exec [debt].[GetDebtorTeamLeaderList]