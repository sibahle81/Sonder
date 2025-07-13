

CREATE PROCEDURE [lead].[GetLeadAuditTrail]
@ClientTypeID INT = NULL,
@LeadStartDate DATE = NULL, 
@LeadEndDate DATE = NULL

AS
BEGIN

DECLARE @LeadNumber VARCHAR(MAX);
DECLARE @DisplayName VARCHAR(MAX);
DECLARE @Company VARCHAR(MAX);
DECLARE @ReceivedDate VARCHAR(MAX);
DECLARE @LeadClientStatus VARCHAR(MAX);
DECLARE @LeadSource VARCHAR(MAX);
DECLARE @ClientType VARCHAR(MAX);
DECLARE @CreatedBy VARCHAR(MAX);
DECLARE @CreatedDate VARCHAR(MAX);
DECLARE @ModifiedBy VARCHAR(MAX);
DECLARE @ModifiedDate VARCHAR(MAX);
DECLARE @Action VARCHAR(MAX);
DECLARE @LeadBefore VARCHAR(MAX);
DECLARE @LeadAfter VARCHAR(MAX);
DECLARE @StatusBefore VARCHAR(MAX);
DECLARE @StatusAfter VARCHAR(MAX);
DECLARE @LeadSourceBefore VARCHAR(MAX);
DECLARE @LeadSourceAfter VARCHAR(MAX);
DECLARE @NewItem VARCHAR(MAX);
DECLARE @OldItem VARCHAR(MAX);
DECLARE @CreatedByPerson VARCHAR(MAX);
DECLARE @ModifiedByPerson VARCHAR(MAX);

   IF OBJECT_ID('tempdb..##temp_leadAudit') IS NOT NULL DROP TABLE ##temp_leadAudit

	CREATE TABLE ##temp_leadAudit (
		LeadNumber VARCHAR(MAX),
		DisplayName VARCHAR(MAX),
		Company VARCHAR(MAX),
		ReceivedDate VARCHAR(MAX),
		LeadClientStatus VARCHAR(MAX),
		LeadSource VARCHAR(MAX),
		ClientType VARCHAR(MAX),
		CreatedBy VARCHAR(MAX),
		CreatedDate VARCHAR(MAX),
		ModifiedBy VARCHAR(MAX),
		ModifiedDate VARCHAR(MAX),
		FieldUpdated VARCHAR(MAX),
		OldDetails VARCHAR(MAX),
		NewDetails VARCHAR(MAX),
		CreatedByPerson VARCHAR(MAX),
		ModifiedByPerson VARCHAR(MAX));


	DECLARE cursor_lead CURSOR FOR
	SELECT DISTINCT LeadNumber = JSON_VALUE(NewItem,'$.Code'),
		   DisplayName = JSON_VALUE(NewItem,'$.DisplayName'),
		   Company = Company.[Name],
		   ReceivedDate = JSON_VALUE(NewItem,'$.ReceivedDate'),
		   LeadClientStatus = [STATUS].[Name],
		   LeadSource = JSON_VALUE(NewItem,'$.LeadSource'),
		   CreatedBy = JSON_VALUE(NewItem,'$.CreatedBy'),
		   CreatedDate = JSON_VALUE(NewItem,'$.CreatedDate'),
		   ModifiedBy = IIF(JSON_VALUE(NewItem,'$.CreatedDate') = JSON_VALUE(NewItem,'$.ModifiedDate'),NULL,JSON_VALUE(NewItem,'$.ModifiedBy')),
		   ModifiedDate = IIF(JSON_VALUE(NewItem,'$.CreatedDate') = JSON_VALUE(NewItem,'$.ModifiedDate'),NULL,JSON_VALUE(NewItem,'$.ModifiedDate')),
		   ClientType = ClientType.[Name],
		   [AUDIT].[Action],
		   [AUDIT].[OldItem],
		   [AUDIT].[NewItem],
		   [User].DisplayName AS CreatedByPerson,
		   ModifiedByPerson = (SELECT [User].DisplayName FROM [security].[User] WHERE [User].Email = JSON_VALUE(NewItem,'$.ModifiedBy'))
    FROM [AZT-MCC-AUDIT].[audit].[AuditLog][AUDIT]
	INNER JOIN [common].[LeadClientStatus] [STATUS] ON [STATUS].Id = JSON_VALUE(NewItem,'$.LeadClientStatus')
	INNER JOIN [common].[ClientType] ClientType ON ClientType.Id = JSON_VALUE(NewItem,'$.ClientType')
	INNER JOIN [lead].[Company] Company ON Company.LeadId = JSON_VALUE(NewItem,'$.LeadId')
	INNER JOIN [security].[User][User] ON [User].Email = JSON_VALUE(NewItem,'$.CreatedBy') 
	WHERE ItemType = 'lead_lead'
	AND (@ClientTypeId  IS NULL OR ClientType.Id = @ClientTypeId OR @ClientTypeId = 8) 
	AND (@LeadStartDate Is NUll OR JSON_VALUE(NewItem,'$.CreatedDate') BETWEEN @LeadStartDate AND @LeadEndDate)
	AND [AUDIT].[Action] <> 'update'
    ORDER BY JSON_VALUE(NewItem,'$.CreatedDate')

	OPEN cursor_lead;
	FETCH NEXT FROM cursor_lead INTO 
	@LeadNumber,
	@DisplayName,
	@Company,
	@ReceivedDate,
	@LeadClientStatus,
	@LeadSource,
	@CreatedBy,
	@CreatedDate,
	@ModifiedBy,
	@ModifiedDate,
	@ClientType,
	@Action,
	@LeadBefore,
	@LeadAfter,
	@CreatedByPerson,
	@ModifiedByPerson

		WHILE @@FETCH_STATUS = 0
		BEGIN
			IF @Action = 'Modified' 
				BEGIN

					SET @StatusBefore  = (SELECT TOP 1 [NAME] FROM [common].[LeadClientStatus] WHERE [Id] = CAST(JSON_VALUE(@LeadBefore,'$.LeadClientStatus')  AS INT)) ;
					SET @StatusAfter   = (SELECT TOP 1 [NAME] FROM [common].[LeadClientStatus] WHERE [Id] = CAST(JSON_VALUE(@LeadAfter,'$.LeadClientStatus')  AS INT)) ;
		
					IF JSON_VALUE(@LeadBefore,'$.LeadClientStatus') <> JSON_VALUE(@LeadAfter,'$.LeadClientStatus') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_leadAudit WHERE LeadNumber = @LeadNumber	AND DisplayName = @DisplayName  
																   AND Company = @Company AND ReceivedDate = @ReceivedDate  
																   AND LeadClientStatus = @LeadClientStatus AND LeadSource = @LeadSource  
																   AND ClientType = @ClientType AND CreatedBy = @CreatedBy 
																   AND FieldUpdated = 'Lead Client Status' AND OldDetails = @StatusBefore
																   AND NewDetails = @StatusAfter)
						 BEGIN
							
					
							
							 INSERT INTO ##temp_leadAudit (LeadNumber, DisplayName,Company, ReceivedDate, LeadClientStatus, LeadSource,ClientType, CreatedBy,CreatedDate, ModifiedBy, ModifiedDate,FieldUpdated,OldDetails,NewDetails,CreatedByPerson,ModifiedByPerson)
								VALUES(@LeadNumber, @DisplayName, @Company, @ReceivedDate, @LeadClientStatus, @LeadSource, @ClientType, @CreatedBy, @CreatedDate, @ModifiedBy,@ModifiedDate,'Lead Client Status', @StatusBefore, @StatusAfter,@CreatedByPerson,@ModifiedByPerson)
						 END

					END

					SET @LeadSourceBefore  = (SELECT TOP 1 [NAME] FROM [common].[LeadSource] WHERE [Id] = CAST(JSON_VALUE(@LeadBefore,'$.LeadSource')  AS INT)) ;
					SET @LeadSourceAfter   = (SELECT TOP 1 [NAME] FROM [common].[LeadSource] WHERE [Id] = CAST(JSON_VALUE(@LeadAfter,'$.LeadSource')  AS INT)) ;

					IF JSON_VALUE(@LeadBefore,'$.LeadSource') <> JSON_VALUE(@LeadAfter,'$.LeadSource') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_leadAudit WHERE LeadNumber = @LeadNumber	AND DisplayName = @DisplayName  
																   AND Company = @Company AND ReceivedDate = @ReceivedDate  
																   AND LeadClientStatus = @LeadClientStatus AND LeadSource = @LeadSource  
																   AND ClientType = @ClientType AND CreatedBy = @CreatedBy 
																   AND FieldUpdated = 'Lead Source' AND OldDetails = @LeadSourceBefore
																   AND NewDetails = @LeadSourceAfter )
						 BEGIN
							
						
							
							 INSERT INTO ##temp_leadAudit (LeadNumber, DisplayName,Company, ReceivedDate, LeadClientStatus, LeadSource,ClientType, CreatedBy,CreatedDate, ModifiedBy, ModifiedDate,FieldUpdated,OldDetails,NewDetails,CreatedByPerson,ModifiedByPerson)
								VALUES(@LeadNumber, @DisplayName, @Company, @ReceivedDate, @LeadClientStatus, @LeadSource, @ClientType, @CreatedBy, @CreatedDate, @ModifiedBy,@ModifiedDate,'Lead Source', @LeadSourceBefore, @LeadSourceAfter,@CreatedByPerson,@ModifiedByPerson)
						 END

					END

					IF JSON_VALUE(@LeadBefore,'$.DisplayName') <> JSON_VALUE(@LeadAfter,'$.DisplayName') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_leadAudit WHERE LeadNumber = @LeadNumber	AND DisplayName = @DisplayName  
																   AND Company = @Company AND ReceivedDate = @ReceivedDate  
																   AND LeadClientStatus = @LeadClientStatus AND LeadSource = @LeadSource  
																   AND ClientType = @ClientType AND CreatedBy = @CreatedBy 
																   AND FieldUpdated = 'Display Name' AND OldDetails = JSON_VALUE(@LeadBefore,'$.DisplayName')
																   AND NewDetails = JSON_VALUE(@LeadAfter,'$.DisplayName'))
						 BEGIN
							
						
							
							 INSERT INTO ##temp_leadAudit (LeadNumber, DisplayName,Company, ReceivedDate, LeadClientStatus, LeadSource,ClientType, CreatedBy,CreatedDate, ModifiedBy, ModifiedDate,FieldUpdated,OldDetails,NewDetails,CreatedByPerson,ModifiedByPerson)
								VALUES(@LeadNumber, @DisplayName, @Company, @ReceivedDate, @LeadClientStatus, @LeadSource, @ClientType, @CreatedBy, @CreatedDate, @ModifiedBy,@ModifiedDate,'Display Name', JSON_VALUE(@LeadBefore,'$.DisplayName'), JSON_VALUE(@LeadAfter,'$.DisplayName') ,@CreatedByPerson,@ModifiedByPerson)
						 END

					END

					IF JSON_VALUE(@LeadBefore,'$.IsDeleted') <> JSON_VALUE(@LeadAfter,'$.IsDeleted') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_leadAudit WHERE LeadNumber = @LeadNumber	AND DisplayName = @DisplayName  
																   AND Company = @Company AND ReceivedDate = @ReceivedDate  
																   AND LeadClientStatus = @LeadClientStatus AND LeadSource = @LeadSource  
																   AND ClientType = @ClientType AND CreatedBy = @CreatedBy 
																   AND FieldUpdated = 'Is Deleted' AND OldDetails = JSON_VALUE(@OldItem,'$.IsDeleted') 
																   AND NewDetails = JSON_VALUE(@NewItem,'$.IsDeleted') )
						 BEGIN
							
							  INSERT INTO ##temp_leadAudit (LeadNumber, DisplayName,Company, ReceivedDate, LeadClientStatus, LeadSource,ClientType, CreatedBy,CreatedDate, ModifiedBy, ModifiedDate,FieldUpdated,OldDetails,NewDetails,CreatedByPerson,ModifiedByPerson)
								VALUES(@LeadNumber, @DisplayName, @Company, @ReceivedDate, @LeadClientStatus, @LeadSource, @ClientType, @CreatedBy, @CreatedDate, @ModifiedBy,@ModifiedDate,'Is Deleted', JSON_VALUE(@OldItem,'$.IsDeleted'), JSON_VALUE(@NewItem,'$.IsDeleted'),@CreatedByPerson,@ModifiedByPerson)
						 END

					END
				END	
				ELSE
				BEGIN
					
					IF NOT EXISTS (SELECT * FROM ##temp_leadAudit WHERE LeadNumber = @LeadNumber) 
					BEGIN
						 INSERT INTO ##temp_leadAudit (LeadNumber, DisplayName,Company, ReceivedDate, LeadClientStatus, LeadSource,ClientType, CreatedBy,CreatedDate,CreatedByPerson, ModifiedBy, ModifiedDate,FieldUpdated,OldDetails,NewDetails,ModifiedByPerson)
								VALUES(@LeadNumber, @DisplayName, @Company, @ReceivedDate, @LeadClientStatus, @LeadSource, @ClientType, @CreatedBy, @CreatedDate,@CreatedByPerson,@ModifiedBy,@CreatedDate,'New entry','New entry','New entry',@ModifiedByPerson)
					END
					
				
				END

				FETCH NEXT FROM cursor_lead INTO 
				@LeadNumber,
				@DisplayName,
				@Company,
				@ReceivedDate,
				@LeadClientStatus,
				@LeadSource,
				@CreatedBy,
				@CreatedDate,
				@ModifiedBy,
				@ModifiedDate,
				@ClientType,
				@Action,
				@LeadBefore,
				@LeadAfter,
				@CreatedByPerson,
				@ModifiedByPerson
		END

		CLOSE cursor_lead;

		DEALLOCATE cursor_lead;

		SELECT DISTINCT * FROM ##temp_leadAudit;


END

