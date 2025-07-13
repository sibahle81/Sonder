CREATE Procedure [legal].[GetAttorneyInstructionSelectDocument_Details]
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

SET @SelectCount = (select 
		Count (*)
	from 
	 [legal].[DocumentPackDocs]
	where 
	IsDeleted = 0)

SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[DocumentPackDocs]
	where 
	[legal].[DocumentPackDocs].IsDeleted = 0 
		and  ([legal].[DocumentPackDocs].DocumentPath like ('%'+ @SearchCreatia +'%') OR [legal].[DocumentPackDocs].DocumentName like ('%'+ @SearchCreatia +'%') or [legal].[DocumentPackDocs].Description  like ('%'+ @SearchCreatia +'%')) 
		and [legal].[DocumentPackDocs].Status = @Status)

	select 
		[legal].[DocumentPackDocs].Id ,			
		[legal].[DocumentPackDocs].DocPackId,
		[legal].[DocumentPackDocs].DocumentPath,
		[legal].[DocumentPackDocs].DocumentName,
		[legal].[DocumentPackDocs].Description,
		[legal].[DocumentPackDocs].Status,				
		[legal].[DocumentPack].ReferralId, 
		[legal].[DocumentPack].AttorneyId,
		[legal].[DocumentPack].PackName,
		[legal].[DocumentPackDocs].IsDeleted,		
		[legal].[DocumentPackDocs].CreatedBy,	
		[legal].[DocumentPackDocs].CreatedDate,	
		[legal].[DocumentPackDocs].CreatedDate,
		[legal].[DocumentPackDocs].ModifiedBy,
		[legal].[DocumentPackDocs].ModifiedDate,		
		@RecordCount 
	from 
	[legal].[DocumentPackDocs] inner join [legal].[DocumentPack] on [legal].[DocumentPack].Id= [legal].[DocumentPackDocs].[DocPackId]	
	where 
		[legal].[DocumentPackDocs].IsDeleted = 0 
		and  ([legal].[DocumentPackDocs].DocumentPath like ('%'+ @SearchCreatia +'%') OR [legal].[DocumentPackDocs].DocumentName like ('%'+ @SearchCreatia +'%') or [legal].[DocumentPackDocs].Description  like ('%'+ @SearchCreatia +'%')) 
		and [legal].[DocumentPackDocs].Status = @Status
		order by [legal].[DocumentPackDocs].CreatedDate 
		OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY
END
--exec [legal].[GetAttorneyInstructionSelectDocument_Details] 23,1,10,'','','','Active' 