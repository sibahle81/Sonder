CREATE   Procedure [debt].[getDebtListForAgent]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@Status as varchar(20),
@RecordCount INT = 0 OUTPUT
)
As
Begin 	
	DECLARE @SelectCount As NVARCHAR(MAX)
	Declare @RolesName as varchar(500)	
	Declare @SetOpenBalance as numeric (18,2)

SET @SelectCount = (select 
		Count (*)
	from 
	 [client].FinPayee  
	where 
	IsDeleted = 0)
	
set @RolesName =( select [security].[Role].Name from [security].[User] inner join [security].[Role] on [security].[Role].Id= [security].[User].RoleId where [security].[User].Id = @userId and [security].[Role].[Name] in ('Debtor Collection Team Leader','Debtor Collection Agent'))
if(@RolesName!='')	
BEGIN
SET @RecordCount = 	(SELECT COUNT(*) from (select
 distinct [client].[Roleplayer].RolePlayerId FinpayeeId,
 [client].[Roleplayer].RolePlayerId Id,
 [Client].[FinPayee].FinPayeNumber [CustomerNumber],
 [client].[Roleplayer].DisplayName [CustomerName], 
 CAST(100.51 AS decimal(18,2)) OpeningBalance,
 CAST(100.51 AS decimal(18,2)) CurrentBalance,
 [client].[Roleplayer].EmailAddress , 
 CASE WHEN [Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company'
			ELSE 'Individual' END AS ClientType, 
			sum(DATEDIFF(day, [billing].[Invoice].CollectionDate,GETDATE())) DueByDay1, 
			[common].[IndustryClass].Name [Book], 
 [DEBT].ManagmentTransactions.PTPCount PTP, 
 [DEBT].ManagmentTransactions.AssignedId , 
 [security].[User].DisplayName [AssignedName], 
case when isnull([debt].[TransactionCollectionStatus].NextActionDate,'')='' then NULL ELSE  [debt].[TransactionCollectionStatus].NextActionDate END NextActionDate,
 isnull([common].DepartmentLookup.Name,'') TransferedToDepartment, 
case when  [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=1 then 'New' 
when [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=2 then 'Pending'  
when [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=3 then 'Ongoing' 
when [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=4 then 'Closed' End DocumentStatus,
case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then [debt].[ManagmentTransactions].ModifiedDate else [debt].[TransactionCollectionStatus].ModifiedDate END AS LastChangedDate,
case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then 
(select case when isnull([security].[user].DisplayName,'')='' then [security].[user].UserName else [security].[user].DisplayName END From [security].[user] 
	where [security].[user].Email=[debt].[TransactionCollectionStatus].ModifiedBy)  else 
(select case when isnull([security].[user].DisplayName,'')='' then [security].[user].UserName else [security].[user].DisplayName END From [security].[user] 
	where [security].[user].Email=[debt].[TransactionCollectionStatus].ModifiedBy)
 END AS LastChanged,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then 'New' else  isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') END AS LastStatus,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') != '' then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE())   else '0' END AS DueByDay2,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') != '' then  
 case when DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) > 0 
 then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) else '-' END  
 else '0' END  AS DueByDay3, 
  case when isnull([debt].[TransactionCollectionStatus].NextActionDate,'')='' then DATEDIFF(day,[debt].[ManagmentTransactions].ModifiedDate,GETDATE()) 
  when isnull([debt].[TransactionCollectionStatus].NextActionDate,'') !='' then 
 case when DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) > 0 
 then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) else '-' END  
 else '0' END    AS DueByDay,
 
 [debt].[TransactionCollectionStatus].Note,  
case when isnull([debt].[TransactionCollectionStatus].ModifiedBy,'')='' then [debt].ManagmentTransactions.ModifiedBy else [debt].[TransactionCollectionStatus].ModifiedBy END ModifiedBy,
case when isnull([debt].[TransactionCollectionStatus].ModifiedDate,'')=''   then [debt].ManagmentTransactions.ModifiedDate ELSE [debt].[TransactionCollectionStatus].ModifiedDate END ModifiedDate,
[debt].[ManagmentTransactions].AssignOnDate  
, @RecordCount RecordCounts
from [client].FinPayee 
inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId =[client].FinPayee.RolePlayerId 
inner join [policy].Policy on [policy].Policy.PolicyOwnerId = [client].FinPayee.RolePlayerId 
inner join [billing].[Invoice] on [billing].[Invoice].PolicyId = [policy].Policy.PolicyId 
left join [debt].[TransactionCollectionStatus] on [debt].[TransactionCollectionStatus].FinPayeeId =[client].[Roleplayer].RolePlayerId and [debt].[TransactionCollectionStatus].IsDeleted = 0  
LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
left join [common].[IndustryClass] on [common].[IndustryClass].Id  =  [Company].IndustryClassId 
LEFT JOIN [DEBT].ManagmentTransactions on [DEBT].ManagmentTransactions.FinPayeeId = [client].FinPayee.RolePlayerId 
left join [security].[user] on [security].[user].Id = [DEBT].ManagmentTransactions.AssignedId  
left join [common].DepartmentLookup on [common].DepartmentLookup.DepartmentLookUpId = [debt].[TransactionCollectionStatus].TransferToDepartmentId 
where [billing].[Invoice].InvoiceStatusId =2 and  
((@RolesName='Debtor Collection Agent' and  [DEBT].ManagmentTransactions.AssignedId = @userId) or (@RolesName='Debtor Collection Team Leader' and 1=1 )) 
and 
([Client].[FinPayee].FinPayeNumber LIKE ('%'+ @SearchCreatia +'%') OR [client].[Roleplayer].DisplayName LIKE ('%'+ @SearchCreatia +'%')) 
and 
((
@status='open' AND [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId = 1 and [debt].[ManagmentTransactions].AssignedId = @userId 
) 
Or 
(@status ='overdue'    
and [debt].[ManagmentTransactions].AssignedId  = @userId 
 and  
 ( 
 ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId = 1 and convert(varchar,[debt].[ManagmentTransactions].ModifiedDate,112) < convert(varchar,getdate(),112) )
 or 
 ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId = 3 and  convert(varchar,[debt].[TransactionCollectionStatus].NextActionDate,112) < convert(varchar,getdate(),112)  )
 )
) 
Or 
(@status='overdueforteam' 
  and [debt].[ManagmentTransactions].AssignedId  != @userId
  and 
  (
  ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId =1 and  convert(varchar,[debt].[ManagmentTransactions].ModifiedDate,112) < convert(varchar,getdate(),112)) 
  or 
  ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=3 and  convert(varchar,[debt].[TransactionCollectionStatus].NextActionDate,112) < convert(varchar,getdate(),112))
  )
) 
Or 
(@status='ongoing' and [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId=  3 
) 
OR 
(@status='all'  
) 
)

Group by 
[client].[Roleplayer].RolePlayerId, [Client].[FinPayee].FinPayeNumber, [client].[Roleplayer].DisplayName, 
[client].[Roleplayer].EmailAddress, [Roleplayer].RolePlayerIdentificationTypeId, [common].[IndustryClass].Name,[debt].ManagmentTransactions.PTPCount,  
[DEBT].ManagmentTransactions.AssignedId , [security].[User].DisplayName, 
[debt].[TransactionCollectionStatus].NextActionDate, [common].DepartmentLookup.Name,  [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId,  
[debt].[TransactionCollectionStatus].CollectionStatusName,[debt].[TransactionCollectionStatus].Note,[debt].[TransactionCollectionStatus].ModifiedBy, [debt].[ManagmentTransactions].ModifiedBy ,  
[debt].[TransactionCollectionStatus].ModifiedDate,[debt].[ManagmentTransactions].ModifiedDate,[debt].[ManagmentTransactions].AssignOnDate    
) tbl_tmp )
 
select
 distinct [client].[Roleplayer].RolePlayerId FinpayeeId,
 [client].[Roleplayer].RolePlayerId Id,
 [Client].[FinPayee].FinPayeNumber [CustomerNumber],
 [client].[Roleplayer].DisplayName [CustomerName], 
 CAST(100.51 AS decimal(18,2)) OpeningBalance,
 CAST(100.51 AS decimal(18,2)) CurrentBalance,
 [client].[Roleplayer].EmailAddress , 
 CASE WHEN [Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company'
			ELSE 'Individual' END AS ClientType, 
			sum(DATEDIFF(day, [billing].[Invoice].CollectionDate,GETDATE())) DueByDay1, 
			[common].[IndustryClass].Name [Book], 
 [DEBT].ManagmentTransactions.PTPCount PTP, 
 [DEBT].ManagmentTransactions.AssignedId , 
 [security].[User].DisplayName [AssignedName], 
case when isnull([debt].[TransactionCollectionStatus].NextActionDate,'')='' then NULL ELSE  [debt].[TransactionCollectionStatus].NextActionDate END NextActionDate,
 isnull([common].DepartmentLookup.Name,'') TransferedToDepartment, 
case when  [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=1 then 'New' 
when [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=2 then 'Pending'  
when [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=3 then 'Ongoing' 
when [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=4 then 'Closed' End DocumentStatus,
case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then [debt].[ManagmentTransactions].ModifiedDate else [debt].[TransactionCollectionStatus].ModifiedDate END AS LastChangedDate,
case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then 
(select case when isnull([security].[user].DisplayName,'')='' then [security].[user].UserName else [security].[user].DisplayName END From [security].[user] 
	where [security].[user].Email=[debt].[TransactionCollectionStatus].ModifiedBy)  else 
(select case when isnull([security].[user].DisplayName,'')='' then [security].[user].UserName else [security].[user].DisplayName END From [security].[user] 
	where [security].[user].Email=[debt].[TransactionCollectionStatus].ModifiedBy)
 END AS LastChanged,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then 'New' else  isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') END AS LastStatus,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') != '' then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE())   else '0' END AS DueByDay2,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') != '' then  
 case when DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) > 0 
 then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) else '-' END  
 else '0' END  AS DueByDay3, 
  case when isnull([debt].[TransactionCollectionStatus].NextActionDate,'')='' then DATEDIFF(day,[debt].[ManagmentTransactions].ModifiedDate,GETDATE()) 
  when isnull([debt].[TransactionCollectionStatus].NextActionDate,'') !='' then 
 case when DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) > 0 
 then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) else '-' END  
 else '0' END    AS DueByDay,
 
 [debt].[TransactionCollectionStatus].Note,  
case when isnull([debt].[TransactionCollectionStatus].ModifiedBy,'')='' then [debt].ManagmentTransactions.ModifiedBy else [debt].[TransactionCollectionStatus].ModifiedBy END ModifiedBy,
case when isnull([debt].[TransactionCollectionStatus].ModifiedDate,'')=''   then [debt].ManagmentTransactions.ModifiedDate ELSE [debt].[TransactionCollectionStatus].ModifiedDate END ModifiedDate,
[debt].[ManagmentTransactions].AssignOnDate  
, @RecordCount RecordCounts
from [client].FinPayee 
inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId =[client].FinPayee.RolePlayerId 
inner join [policy].Policy on [policy].Policy.PolicyOwnerId = [client].FinPayee.RolePlayerId 
inner join [billing].[Invoice] on [billing].[Invoice].PolicyId = [policy].Policy.PolicyId 
left join [debt].[TransactionCollectionStatus] on [debt].[TransactionCollectionStatus].FinPayeeId =[client].[Roleplayer].RolePlayerId and [debt].[TransactionCollectionStatus].IsDeleted = 0  
LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
left join [common].[IndustryClass] on [common].[IndustryClass].Id  =  [Company].IndustryClassId 
LEFT JOIN [DEBT].ManagmentTransactions on [DEBT].ManagmentTransactions.FinPayeeId = [client].FinPayee.RolePlayerId 
left join [security].[user] on [security].[user].Id = [DEBT].ManagmentTransactions.AssignedId  
left join [common].DepartmentLookup on [common].DepartmentLookup.DepartmentLookUpId = [debt].[TransactionCollectionStatus].TransferToDepartmentId 
where [billing].[Invoice].InvoiceStatusId =2 and  
((@RolesName='Debtor Collection Agent' and  [DEBT].ManagmentTransactions.AssignedId = @userId) or (@RolesName='Debtor Collection Team Leader' and 1=1 )) 
and 
([Client].[FinPayee].FinPayeNumber LIKE ('%'+ @SearchCreatia +'%') OR [client].[Roleplayer].DisplayName LIKE ('%'+ @SearchCreatia +'%')) 
and 
((
@status='open' AND [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId = 1 and [debt].[ManagmentTransactions].AssignedId = @userId 
) 
Or 
(@status ='overdue'    
and [debt].[ManagmentTransactions].AssignedId  = @userId 
 and  
 ( 
 ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId = 1 and convert(varchar,[debt].[ManagmentTransactions].ModifiedDate,112) < convert(varchar,getdate(),112) )
 or 
 ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId = 3 and  convert(varchar,[debt].[TransactionCollectionStatus].NextActionDate,112) < convert(varchar,getdate(),112)  )
 )
) 
Or 
(@status='overdueforteam' 
  and [debt].[ManagmentTransactions].AssignedId  != @userId
  and 
  (
  ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId =1 and  convert(varchar,[debt].[ManagmentTransactions].ModifiedDate,112) < convert(varchar,getdate(),112)) 
  or 
  ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=3 and  convert(varchar,[debt].[TransactionCollectionStatus].NextActionDate,112) < convert(varchar,getdate(),112))
  )
) 
Or 
(@status='ongoing' and [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId=  3 
) 
OR 
(@status='all'  
) 
)

Group by 
[client].[Roleplayer].RolePlayerId, [Client].[FinPayee].FinPayeNumber, [client].[Roleplayer].DisplayName, 
[client].[Roleplayer].EmailAddress, [Roleplayer].RolePlayerIdentificationTypeId, [common].[IndustryClass].Name,[debt].ManagmentTransactions.PTPCount,  
[DEBT].ManagmentTransactions.AssignedId , [security].[User].DisplayName, 
[debt].[TransactionCollectionStatus].NextActionDate, [common].DepartmentLookup.Name,  [debt].[ManagmentTransactions].DebtCollectionTransactionStatusId,  
[debt].[TransactionCollectionStatus].CollectionStatusName,[debt].[TransactionCollectionStatus].Note,[debt].[TransactionCollectionStatus].ModifiedBy, [debt].[ManagmentTransactions].ModifiedBy ,  
[debt].[TransactionCollectionStatus].ModifiedDate,[debt].[ManagmentTransactions].ModifiedDate,[debt].[ManagmentTransactions].AssignOnDate   
order by [security].[User].DisplayName desc 
OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY
END 
ELSE 
BEGIN 	
	drop table if exists #tbltempMaster1
		CREATE TABLE #tbltempMaster1 
					(
					     FinpayeeId int,  Id int, CustomerNumber varchar(10), CustomerName varchar(10),  OpeningBalance int,  CurrentBalance int, 
						 EmailAddress varchar(10),ClientType varchar(10),  DueByDay1 int, Book varchar(10),  PTP int,  AssignedId int, 
						 AssignedName varchar(10), NextActionDate datetime, TransferedToDepartment varchar(10),
						 DocumentStatus varchar(10), LastChangedDate datetime, LastChanged varchar(10), LastStatus varchar(10),  DueByDay2 int,  
						 DueByDay3 int,  DueByDay int,Note varchar(10), ModifiedBy varchar(10), ModifiedDate datetime, AssignOnDate datetime, RecordCounts  int 
					)
	select * from #tbltempMaster1
	--drop table if exists #tbltempMaster1
END
END
--exec [debt].[GetDebtListForAgent] 1641,1,100,'','','', 'all'    -- @SearchCreatia search critearea 'es' , @Status 'new','overdue','ongoing','all'