

CREATE   Procedure [legal].[getTribunalDetails]
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
DECLARE @RolesName as varchar(500)	
Declare @StatusCondition as int =  (select common.LegalCareCollectionStatus.Id from common.LegalCareCollectionStatus where common.LegalCareCollectionStatus.Name =@Status )
SET @SelectCount = (select 
		Count (*)
	from 
	[legal].[TribunalDetails] 
	where 
		[legal].[TribunalDetails].IsDeleted = 0 
		and  ( [legal].[TribunalDetails].CustomerName like ('%'+ @SearchCreatia +'%') ) 
		and [legal].[TribunalDetails].LegalCareTribunalStatusId = @StatusCondition
		and 
		(
		(@RolesName='Tribunal Legal Secretary' AND 1=1) 
		Or 
		(@RolesName='Tribunal Legal Advisor' AND [legal].[TribunalDetails].AdvisorId =  @userId)
		))

set @RolesName =( select [security].[Role].Name from [security].[User] inner join [security].[Role] on [security].[Role].Id= [security].[User].RoleId where [security].[User].Id =@userId )

SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[TribunalDetails] 
	where 
		[legal].[TribunalDetails].IsDeleted = 0 
		and  ( [legal].[TribunalDetails].CustomerName like ('%'+ @SearchCreatia +'%') ) 
		and [legal].[TribunalDetails].LegalCareTribunalStatusId = @StatusCondition 
	and 
		(
		(@RolesName='Tribunal Legal Secretary' AND 1=1) 
		Or 
		(@RolesName='Tribunal Legal Advisor' AND [legal].[TribunalDetails].AdvisorId =  @userId)
		))

select 
		Id,
		ObjectionId,
		CustomerName,
		DateOfObjection,
		AdvisorId,
		(select case when isnull([security].[user].DisplayName,'')='' then [security].[user].UserName  else [security].[user].DisplayName END  From [security].[user]  where [security].[user].Id=AdvisorId) AssignedAdvisorName , 
		IsAcknowledge,
		ObjectionDocument,
		LegalCareTribunalStatusId,
		(select common.LegalCareTribunalStatus.Name from common.LegalCareTribunalStatus where Id=[legal].TribunalDetails.LegalCareTribunalStatusId ) [Status],
		IsDeleted,
		CreatedBy,
		[legal].[TribunalDetails].CreatedDate,
		ModifiedBy,
		[legal].[TribunalDetails].ModifiedDate,
		[legal].[TribunalDetails].IsActive, 
		@RecordCount 
	from 
	[legal].[TribunalDetails] 	
	where 
		[legal].[TribunalDetails].IsDeleted = 0 
		and ([legal].[TribunalDetails].CustomerName like ('%'+ @SearchCreatia +'%') ) 
		and [legal].[TribunalDetails].LegalCareTribunalStatusId = @StatusCondition
	and 
(
(@RolesName='Tribunal Legal Secretary' AND 1=1) 
Or 
(@RolesName='Tribunal Legal Advisor' AND [legal].[TribunalDetails].AdvisorId =@userId )
)
		order by [legal].[TribunalDetails].ModifiedDate  DESC  
		OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY
END

--exec [legal].[GetTribunalDetails] 1624,1,10,'','','','Open'    -- Parameter @Status = Open =1, Ongoing =2, Closed=3
--exec [legal].[GetTribunalDetails] 1625,1,10,'','','','Open'    -- Parameter @Status = Open =1, Ongoing =2, Closed=3