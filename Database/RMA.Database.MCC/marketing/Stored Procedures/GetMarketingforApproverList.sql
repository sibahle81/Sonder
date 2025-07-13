CREATE   Procedure  [marketing].[GetMarketingforApproverList] 
(
@UserName As varchar(50)
)
As 
Begin
select   distinct
[security].Role.Id ,
[security].Role.Name UserName,
[security].Role.Id RoleId
from [security].Role left join [security].[user] on [security].[user].RoleId = [security].Role.Id 
where [security].Role.IsDeleted = 0 and [security].Role.IsActive =1
and [security].Role.Name like '%'+ @UserName +'%' 
and 0 < (select count(*) from [security].[user] where [security].[user].RoleId =[security].Role.Id)   
order by [security].Role.Name 
End

--exec [marketing].[GetMarketingforApproverList] 'ac'  -- Parameter  @UserName 