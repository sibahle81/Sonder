

CREATE   Procedure [debt].[getDebtorRoleAccessUsers] 

@Role varchar(500)	

As                                                                                                                                                        
Begin                                                                                                                                                      
select 
[security].[User].Id, 
[security].[User].Email, 
[security].[User].UserName 
from [security].[User] 
inner join [security].[Role] on [security].[Role].Id= [security].[User].RoleId                                                                           
and [security].[Role].Name = @Role  and [security].[User].IsDeleted = 0 
order by [security].[User].UserName                                                                                                                        
End                                                                                                                                                         
--exec [debt].GetDebtorRoleAccessUsers 'Debtor Collection Agent' -- Parameter @Role 
--exec [debt].GetDebtorRoleAccessUsers 'Debtor Collection Team Leader' -- Parameter @Role 