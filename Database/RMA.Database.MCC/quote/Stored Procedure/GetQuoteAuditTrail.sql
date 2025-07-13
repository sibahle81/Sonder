


CREATE PROCEDURE [lead].[GetQuoteAuditTrail]
@ClientType INT = NULL,
@StartDate DATE = NULL,
@EndDate DATE = NULL,
@PeriodType INT = NULL,
@QuoteStatusId INT = NULL

AS
BEGIN

DECLARE @QuoteNumber VARCHAR(MAX);
DECLARE @QuoteStatus VARCHAR(MAX);
DECLARE @MemberName VARCHAR(MAX);
DECLARE @ClientTypeDesc VARCHAR(MAX);
DECLARE @DateCreated VARCHAR(MAX);
DECLARE @CreatedBy VARCHAR(MAX);
DECLARE @DateModified VARCHAR(MAX);
DECLARE @ModifiedBy VARCHAR(MAX);
DECLARE @Action VARCHAR(MAX);
DECLARE @NewItem VARCHAR(MAX);
DECLARE @OldItem VARCHAR(MAX);
DECLARE @ProductName VARCHAR(MAX);
DECLARE @ContactPerson VARCHAR(MAX);
DECLARE @PeriodDate DATE = NULL
DECLARE @QuoteStatusBefore VARCHAR(MAX);
DECLARE @QuoteStatusAfter VARCHAR(MAX);
DECLARE @CreatedByPerson VARCHAR(MAX);
DECLARE @ModifiedByPerson VARCHAR(MAX);

DECLARE @CodeStatusBefore NVARCHAR(MAX);
DECLARE @CodeStatusAfter NVARCHAR(MAX);


	
	IF OBJECT_ID('tempdb..##temp_quoteAudit') IS NOT NULL DROP TABLE ##temp_quoteAudit

	CREATE TABLE ##temp_quoteAudit (
		QuoteNumber VARCHAR(MAX),
		QuoteStatus VARCHAR(MAX),
		MemberName VARCHAR(MAX),
		ClientType VARCHAR(MAX),
		ProductName VARCHAR(MAX),
		ContactPerson VARCHAR(MAX),
		DateCreated VARCHAR(MAX),
		CreatedBy VARCHAR(MAX),
		DateModified VARCHAR(MAX),
		ModifiedBy VARCHAR(MAX),
		FieldUpdated VARCHAR(MAX),
		ValueBefore VARCHAR(MAX),
		ValueAfter VARCHAR(MAX),
		CreatedByPerson VARCHAR(MAX),
		ModifiedByPerson VARCHAR(MAX));

	IF(@PeriodType IS NOT NULL AND @PeriodType <> 5)
	BEGIN
		SELECT @PeriodDate =
			CASE WHEN @PeriodType = 1 THEN DATEADD(DAY, DATEDIFF(DAY, 0, GETDATE() -0), 0)
				 WHEN @PeriodType = 2 THEN DATEADD(WEEK, DATEDIFF(WEEK, -1, GETDATE()), -1)
				 WHEN @PeriodType = 3 THEN DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) 
				 WHEN @PeriodType = 4 THEN DATEADD(YEAR, DATEDIFF(YEAR, 0, GETDATE()), 0) 
		END
	END


	DECLARE cursor_quote CURSOR FOR
	SELECT DISTINCT QuoteNumber = [Quote].QuoteNumber,
			QuoteStatus = [QuoteStatus].[Name],
		    MemberName = [Company].[Name] ,
			ClientType = [ClientType].[Name],
			DateCreated = JSON_VALUE(NewItem,'$.CreatedDate'),
			CreatedBy = JSON_VALUE(NewItem,'$.CreatedBy'),
			ModifiedBy = IIF(JSON_VALUE(NewItem,'$.CreatedDate') = JSON_VALUE(NewItem,'$.ModifiedDate'),NULL,JSON_VALUE(NewItem,'$.ModifiedBy')),
		    ModifiedDate = IIF(JSON_VALUE(NewItem,'$.CreatedDate') = JSON_VALUE(NewItem,'$.ModifiedDate'),NULL,JSON_VALUE(NewItem,'$.ModifiedDate')),
			[AUDIT].[Action],
			[AUDIT].[NewItem],
			[AUDIT].[OldItem],
			ProductName = [Product].[Name],
			ContactPerson = [Contact].[Name],
			[User].DisplayName AS CreatedByPerson,
		    ModifiedByPerson = (SELECT [User].DisplayName FROM [security].[User] WHERE [User].Email = JSON_VALUE(NewItem,'$.ModifiedBy'))
		FROM [AZT-MCC-AUDIT].[audit].[AuditLog][AUDIT] INNER JOIN
			 [quote].[Quote][Quote] ON [Quote].[QuoteId] = JSON_VALUE(NewItem,'$.QuoteId')  INNER JOIN
			 [lead].[LeadProduct][LeadProduct] ON [LeadProduct].[QuoteId] = [Quote].[QuoteId] INNER JOIN
	         [product].[Product][Product] ON [Product].Id = [LeadProduct].ProductId INNER JOIN
             [lead].[Company][Company] ON [Company].[LeadId] = [LeadProduct].[LeadId] INNER JOIN
			 [lead].[Lead][Lead] ON [Lead].[LeadId] = [LeadProduct].[LeadId] INNER JOIN
			 [lead].[Contact][Contact] ON [Contact].[LeadId] = [LeadProduct].[LeadId]  INNER JOIN
		     [common].[ClientType][ClientType] ON [ClientType].Id = [Lead].[ClientTypeId] INNER JOIN
			 [common].[QuoteStatus][QuoteStatus] ON [QuoteStatus].Id = [Quote].[QuoteStatusId] INNER JOIN 
			 [security].[User][User] ON [User].Email = JSON_VALUE(NewItem,'$.CreatedBy') 
		WHERE (ItemType = 'quote_QuoteDetail' OR ItemType = 'quote_Quote')
		AND (@ClientType  IS NULL OR ClientType.Id = @ClientType OR @ClientType = 8) 
		AND (@QuoteStatusId IS NULL OR @QuoteStatusId = 8 OR [QuoteStatus].Id = @QuoteStatusId)
		AND (@StartDate IS NULL OR CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111)   >= @StartDate  AND CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111) <= CONVERT(datetime2, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111))
		AND (@PeriodDate  IS NULL OR CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111) >= @PeriodDate )

	OPEN cursor_quote;
	FETCH NEXT FROM cursor_quote INTO 
    @QuoteNumber, 
    @QuoteStatus,
	@MemberName,
	@ClientTypeDesc,
	@DateCreated,
	@CreatedBy,
	@ModifiedBy,
	@DateModified,
	@Action,
	@NewItem,
	@OldItem,
	@ProductName,
	@ContactPerson,
	@CreatedByPerson,
	@ModifiedByPerson

	WHILE @@FETCH_STATUS = 0
		BEGIN
				IF @Action = 'Modified' 
				BEGIN
					--INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy)
					--	VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy)

					IF JSON_VALUE(@NewItem,'$.NumberOfEmployees') <> JSON_VALUE(@OldItem,'$.NumberOfEmployees') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_quoteAudit WHERE QuoteNumber = @QuoteNumber	AND QuoteStatus = @QuoteStatus 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Number Of Employees' AND ValueBefore = JSON_VALUE(@OldItem,'$.NumberOfEmployees') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.NumberOfEmployees') )
						 BEGIN
							 INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,ProductName,CreatedByPerson,ModifiedByPerson)
								VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Number Of Employees', JSON_VALUE(@OldItem,'$.NumberOfEmployees'), JSON_VALUE(@NewItem,'$.NumberOfEmployees'),@ContactPerson,@ProductName,@CreatedByPerson,@ModifiedByPerson)
						 END


						 --INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter)
							--	VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Number Of Employees', JSON_VALUE(@NewItem,'$.NumberOfEmployees'), JSON_VALUE(@OldItem,'$.NumberOfEmployees'))
					END

					IF JSON_VALUE(@NewItem,'$.Earnings') <> JSON_VALUE(@OldItem,'$.Earnings') 
					BEGIN
							 IF NOT EXISTS(SELECT * FROM ##temp_quoteAudit WHERE QuoteNumber = @QuoteNumber	AND QuoteStatus = @QuoteStatus 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Earnings' AND ValueBefore = JSON_VALUE(@OldItem,'$.Earnings') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Earnings') )
							 BEGIN
								INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,ProductName,CreatedByPerson,ModifiedByPerson)
									VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Earnings', JSON_VALUE( @OldItem,'$.Earnings'), JSON_VALUE(@NewItem,'$.Earnings'),@ContactPerson,@ProductName,@CreatedByPerson,@ModifiedByPerson)
							 END


							--INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter)
							--	VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Earnings', JSON_VALUE(@NewItem,'$.Earnings'), JSON_VALUE(@OldItem,'$.Earnings'))


					END

					IF JSON_VALUE(@NewItem,'$.Premium') <> JSON_VALUE(@OldItem,'$.Premium') 
					BEGIN
							
							 IF NOT EXISTS(SELECT * FROM ##temp_quoteAudit WHERE QuoteNumber = @QuoteNumber	AND QuoteStatus = @QuoteStatus 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Premium' AND ValueBefore = JSON_VALUE(@OldItem,'$.Premium') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Premium') )
							 BEGIN
								INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,ProductName,CreatedByPerson,ModifiedByPerson)
									VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Premium', JSON_VALUE(@OldItem ,'$.Premium'), JSON_VALUE(@NewItem,'$.Premium'),@ContactPerson,@ProductName,@CreatedByPerson,@ModifiedByPerson)
							 END


							--INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter)
							--	VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Premium', JSON_VALUE(@NewItem,'$.Premium'), JSON_VALUE(@OldItem,'$.Premium'))

						 
					END

					IF JSON_VALUE(@NewItem,'$.Rate') <> JSON_VALUE(@OldItem,'$.Rate') 
					BEGIN
							 IF NOT EXISTS(SELECT * FROM ##temp_quoteAudit WHERE QuoteNumber = @QuoteNumber	AND QuoteStatus = @QuoteStatus 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'Rate' AND ValueBefore = JSON_VALUE(@OldItem,'$.Rate') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Rate') )
							 BEGIN
								INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,ProductName,CreatedByPerson,ModifiedByPerson)
									VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Rate', JSON_VALUE(@OldItem ,'$.Rate'), JSON_VALUE(@NewItem,'$.Rate'),@ContactPerson,@ProductName,@CreatedByPerson,@ModifiedByPerson)
							 END


							--INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter)
							--	VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'Rate', JSON_VALUE(@NewItem,'$.Rate'), JSON_VALUE(@OldItem,'$.Rate'))
						 
					END

					IF JSON_VALUE(@NewItem,'$.IsDeleted') <> JSON_VALUE(@OldItem,'$.IsDeleted') 
					BEGIN
							
							 IF NOT EXISTS(SELECT * FROM ##temp_quoteAudit WHERE QuoteNumber = @QuoteNumber	AND QuoteStatus = @QuoteStatus 
																   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
																   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
																   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
																   AND FieldUpdated = 'IsDeleted' AND ValueBefore = JSON_VALUE(@OldItem,'$.IsDeleted') 
							 								       AND ValueAfter = JSON_VALUE(@NewItem,'$.IsDeleted') )
							 BEGIN
								INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,ProductName,CreatedByPerson,ModifiedByPerson)
									VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'IsDeleted', JSON_VALUE(@OldItem ,'$.IsDeleted'), JSON_VALUE(@NewItem,'$.IsDeleted'),@ContactPerson,@ProductName,@CreatedByPerson,@ModifiedByPerson)
							 END

						 
					END

					--IF JSON_VALUE(@NewItem,'$.QuoteStatus') <> JSON_VALUE(@OldItem,'$.QuoteStatus') 
					--BEGIN
							
					--		 IF NOT EXISTS(SELECT * FROM ##temp_quoteAudit WHERE QuoteNumber = @QuoteNumber	AND QuoteStatus = @QuoteStatus 
					--											   AND MemberName = @MemberName AND ClientType = @ClientTypeDesc 
					--											   AND DateCreated = @DateCreated AND CreatedBy = @CreatedBy 
					--											   AND DateModified = @DateModified AND ModifiedBy = @ModifiedBy 
					--											   AND FieldUpdated = 'QuoteStatus' AND ValueBefore = JSON_VALUE(@OldItem,'$.QuoteStatus') 
					--		 								       AND ValueAfter = JSON_VALUE(@NewItem,'$.QuoteStatus') )
					--		 BEGIN
								
					--			SET @CodeStatusBefore = (SELECT TOP 1 [Name] FROM [common].[QuoteStatus] WHERE[common].[QuoteStatus].Id = CAST(JSON_VALUE(@OldItem,'$.QuoteStatus') AS INT));
					--			SET @CodeStatusAfter = (SELECT TOP 1 [Name] FROM [common].[QuoteStatus] WHERE[common].[QuoteStatus].Id = CAST(JSON_VALUE(@NewItem,'$.QuoteStatus') AS INT));
					--			INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,DateModified, ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ContactPerson,ProductName,CreatedByPerson,ModifiedByPerson)
					--				VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@DateModified, @ModifiedBy, 'QuoteStatus', @CodeStatusBefore, @CodeStatusAfter,@ContactPerson,@ProductName,@CreatedByPerson,@ModifiedByPerson)
					--		 END

						 
					--END

	
				END	
				ELSE
				BEGIN
					
					IF NOT EXISTS (SELECT * FROM ##temp_quoteAudit WHERE QuoteNumber = @QuoteNumber) 
					BEGIN
						INSERT INTO ##temp_quoteAudit (QuoteNumber, QuoteStatus,MemberName, ClientType, DateCreated, CreatedBy,ContactPerson,ProductName,DateModified,CreatedByPerson,ModifiedByPerson,FieldUpdated, ValueBefore, ValueAfter)
							VALUES(@QuoteNumber, @QuoteStatus, @MemberName, @ClientTypeDesc, @DateCreated, @CreatedBy,@ContactPerson,@ProductName,@DateCreated,@CreatedByPerson,@ModifiedByPerson,'First entry','First entry','First entry')
					END
					
				
				END

				FETCH NEXT FROM cursor_quote INTO 
				@QuoteNumber, 
				@QuoteStatus,
				@MemberName,
				@ClientTypeDesc,
				@DateCreated,
				@CreatedBy,
				@ModifiedBy,
	            @DateModified,
				@Action,
				@NewItem,
				@OldItem,
				@ProductName,
				@ContactPerson,
				@CreatedByPerson,
	            @ModifiedByPerson

		END

		CLOSE cursor_quote;

		DEALLOCATE cursor_quote;

		SELECT  * FROM ##temp_quoteAudit;
END

