
CREATE PROCEDURE [documents].[GetPagedDocumentsByKey]  
( 
@PageNumber	INT,
@PageSize	INT,
@SearchCreatia VARCHAR(50))
AS
declare @offset as int
set @offset = ((@PageNumber - 1) * @PageSize)

declare @d1 Int set @d1 = CharIndex('|',@SearchCreatia,1)
declare @length int set @length = LEN(@SearchCreatia)

declare @key varchar(50)
declare @value varchar(50)

set @key = Substring(@SearchCreatia,1,@d1-1)
set @value = Substring(@SearchCreatia,@d1+1,@length-@d1)

BEGIN
SELECT
[D].Id AS Id,
[K].KeyName AS KeyName,
[K].KeyValue AS KeyValue,
[D].SystemName AS SystemName,
[DSDT].DocumentSetId AS DocumentSetId,
[DSDT].DocTypeId AS DocumentTypeId,
[DSDT].[Required] AS [Required],
[D].[FileName] AS [FileName],
[D].[FileExtension] AS [FileExtension],
[D].DocumentDescription AS DocumentDescription,
[D].DocumentStatusId AS DocumentStatusId,
[D].DocumentUri AS DocumentUri,
[D].CreatedBy,
[D].CreatedDate,
[D].ModifiedBy,
[D].ModifiedDate
FROM [documents].[DocumentKeys] [K]
JOIN [documents].[Document] [D] ON [D].Id = [K].DocumentId
JOIN [azd-mcc].[documents].[DocumentSetDocumentType] [DSDT] ON [DSDT].DocTypeId = [D].DocTypeId
WHERE [K].[keyName] = @key AND [K].[KeyValue] = @value
  order by [D].CreatedDate desc
  OFFSET @offset ROWS 
FETCH NEXT @PageSize ROWS ONLY
END