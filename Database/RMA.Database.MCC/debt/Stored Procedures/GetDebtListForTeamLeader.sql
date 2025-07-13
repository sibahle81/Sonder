
CREATE   Procedure [debt].[getDebtListForTeamLeader]
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
	Declare @StatusCondition as int =  (select common.DebtCollectionTransactionStatus.Id from common.DebtCollectionTransactionStatus where common.DebtCollectionTransactionStatus.Name =@Status ) 

SET @SelectCount = (select 
		Count (*)
	from 
	 [client].FinPayee  
	where 
	IsDeleted = 0)

SET @RecordCount = (select 
		Count (*) from (select
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
 [debt].[TransactionCollectionStatus].NextActionDate,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then [debt].[ManagmentTransactions].ModifiedDate else [debt].[TransactionCollectionStatus].ModifiedDate END AS LastChanged,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then 'New' else  isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') END AS LastStatus,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') != '' then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE())   else '0' END AS DueByDay2,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') != '' then 
 case when DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) > 0 then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) else '-' END  else '0' END AS DueByDay,
 [debt].[TransactionCollectionStatus].Note, 
case when isnull([debt].[TransactionCollectionStatus].ModifiedBy,'')='' then [debt].ManagmentTransactions.ModifiedBy else [debt].[TransactionCollectionStatus].ModifiedBy END ModifiedBy,
case when isnull([debt].[TransactionCollectionStatus].ModifiedDate,'')=''   then [debt].ManagmentTransactions.ModifiedDate ELSE [debt].[TransactionCollectionStatus].ModifiedDate END ModifiedDate,
 [debt].[ManagmentTransactions].AssignOnDate 
from [client].FinPayee 
inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId =[client].FinPayee.RolePlayerId 
inner join [policy].Policy  on [policy].Policy.PolicyOwnerId = [client].FinPayee.RolePlayerId 
inner join [billing].[Invoice] on [billing].[Invoice].PolicyId = [policy].Policy.PolicyId 
left join [debt].[TransactionCollectionStatus] on [debt].[TransactionCollectionStatus].FinPayeeId =[client].[Roleplayer].RolePlayerId 
LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
left join [common].[IndustryClass] on [common].[IndustryClass].Id  =  [Company].IndustryClassId 
LEFT JOIN [DEBT].ManagmentTransactions on [DEBT].ManagmentTransactions.FinPayeeId = [client].FinPayee.RolePlayerId 
left join [security].[user] on [security].[user].Id = [DEBT].ManagmentTransactions.AssignedId  
where [billing].[Invoice].InvoiceStatusId =2 and [debt].[TransactionCollectionStatus].IsDeleted = 0  and [DEBT].ManagmentTransactions.IsDeleted = 0  and 
([Client].[FinPayee].FinPayeNumber LIKE ('%'+ @SearchCreatia +'%') OR [client].[Roleplayer].DisplayName LIKE ('%'+ @SearchCreatia +'%')) 
and 
((
@status='open' AND [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId =  @StatusCondition 
) 
Or 

(@status ='overdue'   
	and (([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId =1 and  [debt].[ManagmentTransactions].ModifiedDate < getdate())   
 or ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId =3 and  [debt].[TransactionCollectionStatus].NextActionDate < getdate()))   
) 
Or 
(@status='overdueforteam' 
  and [debt].[ManagmentTransactions].AssignedId  != @userId
  and (([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId =1 and  [debt].[ManagmentTransactions].ModifiedDate < getdate())   
  or ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=3 and  [debt].[TransactionCollectionStatus].NextActionDate < getdate())) 
) 
Or 
(@status='ongoing' and [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId =  @StatusCondition 
) 
OR 
(@status='all' 
) 
) 
Group by 
[client].[Roleplayer].RolePlayerId, [Client].[FinPayee].FinPayeNumber, [client].[Roleplayer].DisplayName, 
[client].[Roleplayer].EmailAddress, [Roleplayer].RolePlayerIdentificationTypeId, [common].[IndustryClass].Name,[debt].ManagmentTransactions.PTPCount, 
[DEBT].ManagmentTransactions.AssignedId , [security].[User].DisplayName, 
[debt].[TransactionCollectionStatus].NextActionDate, [debt].[TransactionCollectionStatus].CollectionStatusName,[debt].[TransactionCollectionStatus].Note,[debt].[TransactionCollectionStatus].ModifiedBy, [debt].[ManagmentTransactions].ModifiedBy , 
[debt].[TransactionCollectionStatus].ModifiedDate,[debt].[ManagmentTransactions].ModifiedDate,[debt].[ManagmentTransactions].AssignOnDate )as tmpTbl)
 
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
 [debt].[TransactionCollectionStatus].NextActionDate,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then [debt].[ManagmentTransactions].ModifiedDate else [debt].[TransactionCollectionStatus].ModifiedDate END AS LastChanged,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'')='' then 'New' else  isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') END AS LastStatus,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') != '' then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE())   else '0' END AS DueByDay2,
 case when isnull([debt].[TransactionCollectionStatus].CollectionStatusName,'') != '' then 
 case when DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) > 0 then DATEDIFF(day,[debt].[TransactionCollectionStatus].NextActionDate,GETDATE()) else '-' END  else '0' END AS DueByDay,
 [debt].[TransactionCollectionStatus].Note, 
case when isnull([debt].[TransactionCollectionStatus].ModifiedBy,'')='' then [debt].ManagmentTransactions.ModifiedBy else [debt].[TransactionCollectionStatus].ModifiedBy END ModifiedBy,
case when isnull([debt].[TransactionCollectionStatus].ModifiedDate,'')=''   then [debt].ManagmentTransactions.ModifiedDate ELSE [debt].[TransactionCollectionStatus].ModifiedDate END ModifiedDate,
 [debt].[ManagmentTransactions].AssignOnDate ,
 @RecordCount 
from [client].FinPayee 
inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId =[client].FinPayee.RolePlayerId 
inner join [policy].Policy  on [policy].Policy.PolicyOwnerId = [client].FinPayee.RolePlayerId 
inner join [billing].[Invoice] on [billing].[Invoice].PolicyId = [policy].Policy.PolicyId 
left join [debt].[TransactionCollectionStatus] on [debt].[TransactionCollectionStatus].FinPayeeId =[client].[Roleplayer].RolePlayerId 
LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
left join [common].[IndustryClass] on [common].[IndustryClass].Id  =  [Company].IndustryClassId 
LEFT JOIN [DEBT].ManagmentTransactions on [DEBT].ManagmentTransactions.FinPayeeId = [client].FinPayee.RolePlayerId 
left join [security].[user] on [security].[user].Id = [DEBT].ManagmentTransactions.AssignedId  
where [billing].[Invoice].InvoiceStatusId =2 and [debt].[TransactionCollectionStatus].IsDeleted = 0  and [DEBT].ManagmentTransactions.IsDeleted = 0  and 
([Client].[FinPayee].FinPayeNumber LIKE ('%'+ @SearchCreatia +'%') OR [client].[Roleplayer].DisplayName LIKE ('%'+ @SearchCreatia +'%')) 
and 
((
@status='open' AND [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId =  @StatusCondition 
) 
Or 

(@status ='overdue'   
	and (([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId =1 and  [debt].[ManagmentTransactions].ModifiedDate < getdate())   
 or ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId =3 and  [debt].[TransactionCollectionStatus].NextActionDate < getdate()))   
) 
Or 
(@status='overdueforteam' 
  and [debt].[ManagmentTransactions].AssignedId  != @userId
  and (([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId =1 and  [debt].[ManagmentTransactions].ModifiedDate < getdate())   
  or ([debt].[ManagmentTransactions].DebtCollectionTransactionStatusId=3 and  [debt].[TransactionCollectionStatus].NextActionDate < getdate())) 
) 
Or 
(@status='ongoing' and [DEBT].ManagmentTransactions.DebtCollectionTransactionStatusId =  @StatusCondition 
) 
OR 
(@status='all' 
) 
) 
Group by 
[client].[Roleplayer].RolePlayerId, [Client].[FinPayee].FinPayeNumber, [client].[Roleplayer].DisplayName, 
[client].[Roleplayer].EmailAddress, [Roleplayer].RolePlayerIdentificationTypeId, [common].[IndustryClass].Name,[debt].ManagmentTransactions.PTPCount, 
[DEBT].ManagmentTransactions.AssignedId , [security].[User].DisplayName, 
[debt].[TransactionCollectionStatus].NextActionDate, [debt].[TransactionCollectionStatus].CollectionStatusName,[debt].[TransactionCollectionStatus].Note,[debt].[TransactionCollectionStatus].ModifiedBy, [debt].[ManagmentTransactions].ModifiedBy , 
[debt].[TransactionCollectionStatus].ModifiedDate,[debt].[ManagmentTransactions].ModifiedDate,[debt].[ManagmentTransactions].AssignOnDate   

order by [security].[User].DisplayName desc 
OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY
END

----exec [debt].[GetDebtListForTeamLeader] 1642,1,100,'','','', 'overdueforteam'    -- @SearchCreatia search critearea 'es' , @Status 'new','overdue','ongoing','all','overdueforteam'