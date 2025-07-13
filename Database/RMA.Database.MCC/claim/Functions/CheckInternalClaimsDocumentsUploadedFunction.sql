CREATE  FUNCTION [claim].[CheckInternalClaimsDocumentsUploadedFunction] (@PersonEventId INT)
RETURNS bit
AS
BEGIN
    
	declare @retValue bit = 0;
	Declare @IdType int 
	DECLARE @rolePlayerId INT;

	SET @rolePlayerId = (SELECT TOP 1 InsuredLifeId FROM claim.PersonEvent WHERE PersonEventId = @PersonEventId)

	
	Select @IdType = IdTypeId from client.Person  WHERE RolePlayerId = @rolePlayerId

	 SELECT @retValue = (Select CASE WHEN Count(D.Id) >= (Select Count(id) from documents.DocumentSetDocumentType where [Required] = 1 AND DocumentSetId LIKE
					CASE WHEN @IdType = 1 THEN	38  ELSE 41 END) THEN Cast(1 as Bit) ELSE Cast(0 as Bit) END
				FROM documents.DocumentKeys AS DK 
				INNER JOIN documents.Document AS D ON D.Id = DK.DocumentId  
				LEFT JOIN documents.DocumentSetDocumentType AS DSDT ON DSDT.DocTypeId = D.DocTypeId
				where DK.KeyName in ('FirstMedicalReportId','PersonalClaimId') and KeyValue = CAST(@PersonEventId as varchar)  and D.DocumentStatusId = 6 And DSDT.DocumentSetId LIKE
				CASE WHEN @IdType = 1 THEN 
					38 
					ELSE
					41
					END)
 
	return @retValue;
END