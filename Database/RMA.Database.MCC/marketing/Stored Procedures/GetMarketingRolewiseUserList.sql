CREATE   Procedure [marketing].[GetMarketingRolewiseUserList] 
(
	@RoleId as int ,
	@UserName As varchar(50)
)
As 
Begin

select [security].[user].Id , 
	case when isnull([security].[user].DisplayName ,'')='' then [security].[user].UserName  else [security].[user].DisplayName END UserName, 
	[security].[user].RoleId 
from [security].[user] 
	inner join [security].[role] on [security].[role].Id = [security].[user].RoleId 
	where [security].[User].IsDeleted = 0 and  [security].[User].IsActive  = 1
		  and [security].[role].Id = @RoleId 
		  and ([security].[User].UserName like '%'+ @UserName+'%' or [security].[User].DisplayName  like '%'+ @UserName+'%')
			and [security].[user].IsDeleted = 0 	
	order by [security].Role.Name 
End

--exec [marketing].[GetMarketingRolewiseUserList] 1,''  -- Parameter  @RoleId =1 @UserName='a'