
CREATE   Procedure [legal].[getLegalCareCollection_List]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@Status as VARCHAR(150),
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)
Declare @StatusCondition as int =  (select common.LegalCareCollectionStatus.Id from common.LegalCareCollectionStatus where common.LegalCareCollectionStatus.Name =@Status ) 
SET @SelectCount = (select 
		Count (*)	
	from 
	[legal].[LegalCareCollection] inner join [legal].[Attorney] on [legal].[Attorney].Id= [legal].[LegalCareCollection].[AttorneyId]	
	inner  join [client].[RolePlayer] on [client].[RolePlayer].RolePlayerId = [legal].[LegalCareCollection].FinPayeeId 
	where 
		[legal].[LegalCareCollection].IsDeleted = 0
		and [legal].[LegalCareCollection].LegalCareCollectionStatusId = @StatusCondition		
		and  ([client].[RolePlayer].DisplayName like ('%'+ @SearchCreatia +'%') ))

SET @RecordCount = (select 
		Count (*)
		from 
	[legal].[LegalCareCollection] 
    inner  join [client].[RolePlayer] on [client].[RolePlayer].RolePlayerId = [legal].[LegalCareCollection].FinPayeeId   
	left  join [legal].[Attorney] on [legal].[Attorney].Id= [legal].[LegalCareCollection].[AttorneyId]	
    where 
		[legal].[LegalCareCollection].IsDeleted = 0
		and [legal].[LegalCareCollection].LegalCareCollectionStatusId = @StatusCondition		
		and ([client].[RolePlayer].DisplayName like ('%'+ @SearchCreatia +'%')))

	select 
		[legal].[LegalCareCollection].Id ,			
		[legal].[LegalCareCollection].FinPayeeId ,
		[client].[RolePlayer].DisplayName CustomerName,
		[legal].[LegalCareCollection].ManagementTransactionId , 
		[legal].[LegalCareCollection].LegalCareCollectionStatusId, 
		[legal].[LegalCareCollection].LastNoticeSentDate,
		DATEDIFF(day,[legal].[LegalCareCollection].LastNoticeSentDate , getdate()) DaySinceNoticeSent,
		[legal].[LegalCareCollection].AttorneyId,
		[legal].[Attorney].[AttorneyName],
		[legal].[LegalCareCollection].IsSendEmail, 
		[legal].[LegalCareCollection].IsDeleted,		
		[legal].[LegalCareCollection].CreatedBy,	
		[legal].[LegalCareCollection].CreatedDate,	
		[legal].[LegalCareCollection].ModifiedBy,
		[legal].[LegalCareCollection].ModifiedDate,
		[legal].[LegalCareCollection].IsActive 
		, @RecordCount 
	from 
	[legal].[LegalCareCollection] 
    inner  join [client].[RolePlayer] on [client].[RolePlayer].RolePlayerId = [legal].[LegalCareCollection].FinPayeeId   -- 01-11-2023
	left  join [legal].[Attorney] on [legal].[Attorney].Id= [legal].[LegalCareCollection].[AttorneyId]	
    where 
		[legal].[LegalCareCollection].IsDeleted = 0
		and [legal].[LegalCareCollection].LegalCareCollectionStatusId = @StatusCondition		
		and ([client].[RolePlayer].DisplayName like ('%'+ @SearchCreatia +'%') )
		order by 
		[legal].[LegalCareCollection].ModifiedDate desc, 
		[client].[RolePlayer].DisplayName asc  
		
		OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY
END
--exec [legal].[GetLegalCareCollection_List] 1622,1,10,'','','','Open'  -- Parameter 23 = UserId,  Status = 'Open = 1, Ongoing=2, Closed =3'
--exec [legal].[GetLegalCareCollection_List] 1622,1,10,'','','','ongoing'  -- Parameter 23 = UserId,  Status = 'Open = 1, Ongoing=2, Closed =3'  