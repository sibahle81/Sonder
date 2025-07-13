
CREATE   Procedure [legal].[getAttorneyInstruction_Details]
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
	 [legal].[AttorneyInstruction]
	where 
	[legal].[AttorneyInstruction].IsDeleted = 0
		and [legal].[AttorneyInstruction].IsActive  = @Status )
SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[AttorneyInstruction]
	where 
	[legal].[AttorneyInstruction].IsDeleted = 0
		and [legal].[AttorneyInstruction].IsActive = @Status)

	select 
		[legal].[AttorneyInstruction].Id ,			
		[legal].[AttorneyInstruction].AttorneyId,
		[legal].[Attorney].AttorneyName,
		[legal].[AttorneyInstruction].IsActive,		
     	[legal].[AttorneyInstruction].DocPackId,
		[legal].[ObjectionDocumentPack].PackName,
		[legal].[AttorneyInstruction].ReferralId,
		[legal].[AttorneyInstruction].IsDeleted,		
		[legal].[AttorneyInstruction].CreatedBy,	
		[legal].[AttorneyInstruction].CreatedDate,		
		[legal].[AttorneyInstruction].ModifiedBy,
		[legal].[AttorneyInstruction].ModifiedDate,
		[legal].[AttorneyInstruction].IsActive, 
		@SelectCount 
	from 
	[legal].[AttorneyInstruction] inner join [legal].[Attorney] on [legal].[Attorney].Id= [legal].[AttorneyInstruction].[AttorneyId]
	inner join [legal].[ObjectionDocumentPack] on [legal].[ObjectionDocumentPack].Id= [legal].[AttorneyInstruction].[DocPackId]
	where 
		[legal].[AttorneyInstruction].IsDeleted = 0
		and [legal].[AttorneyInstruction].IsActive  = @Status
		order by [legal].[AttorneyInstruction].CreatedDate   
		OFFSET (@PageNumber+-1)* @RowsOfPage	
		ROW FETCH NEXT @RowsOfPage ROWS ONLY	
		 
END
--exec [legal].[GetAttorneyInstruction_Details] 23,1,10,'','','',1    -- Parameter  @Status  =  1= Active, 2 = InActive