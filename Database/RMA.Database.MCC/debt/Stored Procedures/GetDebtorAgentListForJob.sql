CREATE   Procedure [debt].[getDebtorAgentListForJob]                                                                                                         
As                                                                                                                                                        
Begin                                                                                                                                                      
select 
[security].[User].Id, 
[security].[User].Email, 
[security].[User].UserName 
from [security].[User] 
inner join [security].[Role] on [security].[Role].Id= [security].[User].RoleId                                                                           
and [security].[Role].Name in('Debtor Collection Agent','Debtor Collection Team Leader') and [security].[User].IsDeleted = 0  
order by [security].[User].UserName                                                                                                                        
End                                                                                                                                                         

--exec [debt].GetDebtorAgentListForJob 