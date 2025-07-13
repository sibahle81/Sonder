
CREATE      Procedure [legal].[getObjectionDocumentPackDetails]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@DocumentPackId int,
@RecordCount INT = 0 OUTPUT
)
AS

Begin

	DECLARE @SelectCount As NVARCHAR(MAX)

SET @SelectCount = (select 
		Count (*)
	from [legal].ObjectionDocumentPack 
	inner join [legal].ObjectionDocumentPackDetails on [legal].ObjectionDocumentPackDetails.DocumentPackId =[legal].ObjectionDocumentPack.Id  
where [legal].ObjectionDocumentPackDetails.IsDeleted =0 and
	  [legal].ObjectionDocumentPackDetails.ObjectionId = @DocumentPackId and [legal].ObjectionDocumentPack.IsDeleted = 0 )
SET @RecordCount= (select 
		Count (*)
from [legal].ObjectionDocumentPack 
	inner join [legal].ObjectionDocumentPackDetails on [legal].ObjectionDocumentPackDetails.DocumentPackId =[legal].ObjectionDocumentPack.Id  
where [legal].ObjectionDocumentPackDetails.IsDeleted =0 and
	  [legal].ObjectionDocumentPackDetails.ObjectionId = @DocumentPackId)

select [legal].ObjectionDocumentPackDetails.Id,[legal].ObjectionDocumentPack.PackName, [legal].ObjectionDocumentPackDetails.ObjectionId,
[legal].ObjectionDocumentPackDetails.DocumentPackId, [legal].ObjectionDocumentPackDetails.DocumentId ,[legal].ObjectionDocumentPackDetails.DocumentName ,
(select case when isnull([security].[user].DisplayName,'')='' then [security].[user].UserName else [security].[user].DisplayName END  from [security].[user] where [security].[user].Email = [legal].ObjectionDocumentPackDetails.CreatedBy ) UploadedBy, 
[legal].ObjectionDocumentPackDetails.CreatedBy ,
[legal].ObjectionDocumentPackDetails.CreatedDate ,
[legal].ObjectionDocumentPackDetails.ModifiedBy ,
[legal].ObjectionDocumentPackDetails.ModifiedDate,
[legal].ObjectionDocumentPackDetails.IsActive 
, @RecordCount 
from [legal].ObjectionDocumentPack 
	inner join [legal].ObjectionDocumentPackDetails on [legal].ObjectionDocumentPackDetails.DocumentPackId =[legal].ObjectionDocumentPack.Id  
where [legal].ObjectionDocumentPackDetails.IsDeleted =0 and
		[legal].ObjectionDocumentPackDetails.ObjectionId  = @DocumentPackId and [legal].ObjectionDocumentPack.IsDeleted = 0  
Order by 	  [legal].ObjectionDocumentPackDetails.Id 		
OFFSET (@PageNumber+-1)* @RowsOfPage	
		ROW FETCH NEXT @RowsOfPage ROWS ONLY			 
END
--exec [legal].[GetObjectionDocumentPackDetails] 23,1,10,'','','',4 --  Parameter @DocumentPackId  = 5