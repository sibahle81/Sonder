
CREATE PROCEDURE  [documents].[GetDocumentsByPersonEvent]  
( 
	@KeyValue	VARCHAR(50)
)
AS

BEGIN
 --   BEGIN --DEBUGGING
	--DECLARE	@KeyValue		AS VARCHAR(100) =	'23024788';
	--END
SELECT
[D].Id AS Id,
[K].KeyName AS KeyName,
[K].KeyValue AS KeyValue,
[D].SystemName AS SystemName,
[DSDT].DocumentSetId AS DocumentSetId,
[DSDT].DocTypeId AS DocumentTypeId,
[DT].Name AS Name,
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
JOIN [documents].[DocumentSetDocumentType] [DSDT] ON [DSDT].DocTypeId = [D].DocTypeId
JOIN [documents].[DocumentType] [DT] ON [DSDT].DocTypeId = [DT].Id 
WHERE  [K].[KeyValue] = @KeyValue AND D.IsDeleted = 0
  order by [D].CreatedDate desc
END