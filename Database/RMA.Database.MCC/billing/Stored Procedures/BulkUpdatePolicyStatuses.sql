CREATE PROCEDURE [billing].[BulkUpdatePolicyStatuses]
	@idList  NVARCHAR(4000),
	@statusId INT,
	@modifiedBy  VARCHAR(150),
	@modifiedDate DATETIME
 AS
  BEGIN 
	Update  policy.Policy set PolicyStatusId = @statusId,modifiedBy= @modifiedBy,modifiedDate = @modifiedDate  
	where PolicyId in (	SELECT Data FROM dbo.Split(@idList, ','))
  END
