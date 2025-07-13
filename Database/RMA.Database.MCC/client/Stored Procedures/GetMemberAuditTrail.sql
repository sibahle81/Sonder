CREATE PROCEDURE [client].[GetMemberAuditTrail]
@ClientTypeId INT NULL,
@StartDate DATE = NULL,
@EndDate DATE = NULL,
@PeriodType INT NULL,
@MemberStatusId INT NULL

AS

--Declare
--@ClientTypeId INT = NULL,
--@StartDate DATE = NULL,
--@EndDate DATE = NULL,
--@PeriodType INT = NULL,
--@MemberStatusId INT = NULL

--Set @StartDate = '2021-06-01'
--Set @EndDate = '2021-06-07'
--Set @ClientTypeId = 0
--Set @PeriodType = 5
--Set @MemberStatusId = 0



BEGIN

DECLARE @MemberName VARCHAR(MAX);
DECLARE @MemberNumber VARCHAR(MAX);
DECLARE @MemberStatus VARCHAR(MAX);
DECLARE @ClientType VARCHAR(MAX);
DECLARE @CompensationFundReferenceNumber VARCHAR(MAX);
DECLARE @CompensationFundRegistrationNumber VARCHAR(MAX);
DECLARE @CompanyRegistrationNumber VARCHAR(MAX);
DECLARE @DateCreated VARCHAR(MAX);
DECLARE @CreatedBy VARCHAR(MAX);
DECLARE @DateModified VARCHAR(MAX);
DECLARE @ModifiedBy VARCHAR(MAX);
DECLARE @Action VARCHAR(MAX);
DECLARE @NewItem VARCHAR(MAX);
DECLARE @OldItem VARCHAR(MAX);
DECLARE @ItemType VARCHAR(MAX);
DECLARE @PeriodDate DATE = NULL
DECLARE @rolePlayerIdentificationTypeId int = NULL; 
	
	IF OBJECT_ID('tempdb..##temp_roleplayerAudit') IS NOT NULL DROP TABLE ##temp_roleplayerAudit

	CREATE TABLE ##temp_roleplayerAudit (
		MemberName VARCHAR(MAX),
		MemberNumber VARCHAR(MAX),
		MemberStatus VARCHAR(MAX),
		ClientType VARCHAR(MAX),
		CompensationFundReferenceNumber VARCHAR(MAX),
		CompensationFundRegistrationNumber VARCHAR(MAX),
		CompanyRegistrationNumber VARCHAR(MAX),
		[Action] VARCHAR(MAX),
		DateCreated VARCHAR(MAX),
		CreatedBy VARCHAR(MAX),
		DateModified VARCHAR(MAX),
		ModifiedBy VARCHAR(MAX),
		FieldUpdated VARCHAR(MAX),
		ValueBefore VARCHAR(MAX),
		ValueAfter VARCHAR(MAX),
		ItemType VARCHAR(MAX));

	IF(@PeriodType IS NOT NULL AND @PeriodType <> 5)
	BEGIN
		SELECT @PeriodDate =
			CASE WHEN @PeriodType = 1 THEN DATEADD(DAY, DATEDIFF(DAY, 0, GETDATE() -0), 0)
				 WHEN @PeriodType = 2 THEN DATEADD(WEEK, DATEDIFF(WEEK, -1, GETDATE()), -1)
				 WHEN @PeriodType = 3 THEN DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) 
				 WHEN @PeriodType = 4 THEN DATEADD(YEAR, DATEDIFF(YEAR, 0, GETDATE()), 0) 
		END
	END

	IF(@ClientTypeId IS NOT NULL)
	BEGIN
		SELECT @rolePlayerIdentificationTypeId =
			CASE WHEN @ClientTypeId = 1 THEN 1
				 WHEN @ClientTypeId = 0 THEN 2
				 WHEN @ClientTypeId = 3 THEN Null
		END
	END

	IF(@MemberStatus = 0)
		SET @MemberStatus = NULL

	DECLARE cursor_rolePlayer CURSOR FOR
	SELECT DISTINCT 
			MemberName = Roleplayer.DisplayName,
			MemberNumber = [FinPayee].FinPayeNumber,
			CASE 
			WHEN [Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company'
			ELSE 'Individual' END AS ClientType,
			(SELECT CASE WHEN COUNT(*) > 0 THEN 'Active' ELSE 'Active - No policies' END from [policy].[policy] where PolicyOwnerId = roleplayer.RolePlayerId ) as MemberStatus,
		    CompensationFundReferenceNumber = IIF(Roleplayer.RolePlayerIdentificationTypeId = 1 ,NULL, [Company].compensationFundReferenceNumber ) ,
			CompensationFundRegistrationNumber = IIF(Roleplayer.RolePlayerIdentificationTypeId = 1 ,NULL, [Company].referenceNumber) ,
			CompanyRegistrationNumber = IIF(Roleplayer.RolePlayerIdentificationTypeId = 1 ,NULL, [Company].idNumber) ,
			DateCreated = JSON_VALUE(NewItem,'$.CreatedDate'),
			CreatedBy = JSON_VALUE(NewItem,'$.CreatedBy'),
			ModifiedBy = JSON_VALUE(NewItem,'$.ModifiedBy'),
		    ModifiedDate = JSON_VALUE(NewItem,'$.ModifiedDate'),
			[AUDIT].[Action],
			[AUDIT].[NewItem],
			[AUDIT].[OldItem],
			[audit].ItemType
		FROM [audit].[AuditLog] [AUDIT]
		INNER JOIN [Client].[RolePlayer] [Roleplayer] ON [Roleplayer].RolePlayerId = JSON_VALUE(NewItem,'$.RolePlayerId')
		LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[Person] [Person] ON [Person].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[RolePlayerAddress] [Address] ON [Address].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[RolePlayerContact] [Contact] ON [Contact].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[RolePlayerBankingDetails] [Bank] ON [Bank].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [Client].[FinPayee] [FinPayee] ON [FinPayee].RolePlayerId = [Roleplayer].RolePlayerId
		LEFT JOIN [policy].[Policy] [policy] ON [policy].PolicyOwnerId = [Roleplayer].RolePlayerId
		INNER JOIN [security].[User][User] ON [User].Email = JSON_VALUE(NewItem,'$.CreatedBy') 
		WHERE (ItemType = 'client_RolePlayer' OR ItemType = 'client_Person'	
				OR ItemType = 'client_Company' OR ItemType = 'client_RolePlayerContact' 
				OR ItemType = 'client_RolePlayerBankingDetail'OR ItemType = 'client_RolePlayerAddress'
				OR ItemType = 'client_FinPayee')
		AND	(@rolePlayerIdentificationTypeId  IS NULL OR [Roleplayer].RolePlayerIdentificationTypeId = @rolePlayerIdentificationTypeId ) 
		AND (@StartDate IS NULL OR CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111)   >= @StartDate  AND CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111) <= CONVERT(datetime2, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111))
		AND (@PeriodDate  IS NULL OR CONVERT(datetime2,(JSON_VALUE(NewItem,'$.CreatedDate')),111) >= @PeriodDate )


	OPEN cursor_rolePlayer;
	FETCH NEXT FROM cursor_rolePlayer INTO 
		@MemberName,
		@MemberNumber,
		@ClientType,
		@MemberStatus,
		@CompensationFundReferenceNumber,
		@CompensationFundRegistrationNumber ,
		@CompanyRegistrationNumber ,
		@DateCreated ,
		@CreatedBy ,
		@ModifiedBy ,
		@DateModified,
		@Action ,
		@NewItem ,
		@OldItem , 
		@ItemType

		

	WHILE @@FETCH_STATUS = 0
		BEGIN

				IF @Action = 'Modified' 
				BEGIN

					IF JSON_VALUE(@NewItem,'$.IdNumber') <> JSON_VALUE(@OldItem,'$.IdNumber') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.IdNumber') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.IdNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter, ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber, @Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy,IIF(@ItemType = 'client_Company', 'CompanyRegistrationNumber', 'IdNumber'), JSON_VALUE(@OldItem,'$.IdNumber'), JSON_VALUE(@NewItem,'$.IdNumber'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.DisplayName') <> JSON_VALUE(@OldItem,'$.DisplayName') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.DisplayName') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.DisplayName'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter, ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber, @Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy,'Display Name', JSON_VALUE(@OldItem,'$.DisplayName'), JSON_VALUE(@NewItem,'$.DisplayName'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.FirstName') <> JSON_VALUE(@OldItem,'$.FirstName') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.FirstName') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.FirstName'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter, ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber, @Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy,'First Name', JSON_VALUE(@OldItem,'$.FirstName'), JSON_VALUE(@NewItem,'$.FirstName'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.Surname') <> JSON_VALUE(@OldItem,'$.Surname') 
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.Surname') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Surname'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter, ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber, @Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy,'Surname', JSON_VALUE(@OldItem,'$.Surname'), JSON_VALUE(@NewItem,'$.Surname'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.EffectiveDate') <> JSON_VALUE(@OldItem,'$.EffectiveDate')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.EffectiveDate') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.EffectiveDate'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Effective Date', '', JSON_VALUE(@NewItem,'$.EffectiveDate'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.AccountHolderName') <> JSON_VALUE(@OldItem,'$.AccountHolderName')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.AccountHolderName') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.AccountHolderName'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Account Holder Name', JSON_VALUE(@OldItem,'$.AccountHolderName'), JSON_VALUE(@NewItem,'$.AccountHolderName'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.BranchCode') <> JSON_VALUE(@OldItem,'$.BranchCode')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.BranchCode') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.BranchCode'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Branch Code', JSON_VALUE(@OldItem,'$.BranchCode'), JSON_VALUE(@NewItem,'$.BranchCode'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.DateOfBirth') <> JSON_VALUE(@OldItem,'$.DateOfBirth')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.DateOfBirth') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.DateOfBirth'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Date Of Birth', JSON_VALUE(@OldItem,'$.DateOfBirth'), JSON_VALUE(@NewItem,'$.DateOfBirth'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.Name') <> JSON_VALUE(@OldItem,'$.Name')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.Name') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Name'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Company Name', JSON_VALUE(@OldItem,'$.Name'), JSON_VALUE(@NewItem,'$.Name'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.ReferenceNumber') <> JSON_VALUE(@OldItem,'$.ReferenceNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.ReferenceNumber') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.ReferenceNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Compensation Fund Registration Number', JSON_VALUE(@OldItem,'$.ReferenceNumber'), JSON_VALUE(@NewItem,'$.ReferenceNumber'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.CompensationFundReferenceNumber') <> JSON_VALUE(@OldItem,'$.CompensationFundReferenceNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.CompensationFundReferenceNumber') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.CompensationFundReferenceNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Compensation Fund Reference Number', JSON_VALUE(@OldItem,'$.CompensationFundReferenceNumber'), JSON_VALUE(@NewItem,'$.CompensationFundReferenceNumber'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.VatRegistrationNo') <> JSON_VALUE(@OldItem,'$.VatRegistrationNo')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.VatRegistrationNo') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.VatRegistrationNo'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Vat Registration No', JSON_VALUE(@OldItem,'$.VatRegistrationNo'), JSON_VALUE(@NewItem,'$.VatRegistrationNo'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.IndustryId') <> JSON_VALUE(@OldItem,'$.IndustryId')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.IndustryId') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.IndustryId'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Industry Id', (Select [Name] From [common].[Industry] where id = JSON_VALUE(@OldItem,'$.IndustryId')) , (Select [Name] From [common].[Industry] where id = JSON_VALUE(@NewItem,'$.IndustryId')),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.IndustryClass') <> JSON_VALUE(@OldItem,'$.IndustryClass')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.IndustryClass') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.IndustryClass'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Industry Class', (Select [Name] From [common].[IndustryClass] where id = JSON_VALUE(@OldItem,'$.IndustryClass')), (Select [Name] From [common].[IndustryClass] where id = JSON_VALUE(@NewItem,'$.IndustryClass')),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.CompanyLevel') <> JSON_VALUE(@OldItem,'$.CompanyLevel')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.CompanyLevel') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.CompanyLevel'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Company Level', (Select [Name] From [common].[CompanyLevel] where id = JSON_VALUE(@OldItem,'$.CompanyLevel')), (Select [Name] From [common].[CompanyLevel] where id = JSON_VALUE(@NewItem,'$.CompanyLevel')),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.Title') <> JSON_VALUE(@OldItem,'$.Title')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.Title') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Title'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Title', (Select [Name] From [common].[Title] where id = JSON_VALUE(@OldItem,'$.Title')), (Select [Name] From [common].[Title] where id = JSON_VALUE(@NewItem,'$.Title')),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.Firstname') <> JSON_VALUE(@OldItem,'$.Firstname')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.Firstname') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Firstname'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'First name', JSON_VALUE(@OldItem,'$.Firstname'), JSON_VALUE(@NewItem,'$.Firstname'),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.EmailAddress') <> JSON_VALUE(@OldItem,'$.EmailAddress')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.EmailAddress') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.EmailAddress'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Email Address', JSON_VALUE(@OldItem,'$.EmailAddress'), JSON_VALUE(@NewItem,'$.EmailAddress'),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.TelephoneNumber') <> JSON_VALUE(@OldItem,'$.TelephoneNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.TelephoneNumber') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.TelephoneNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Telephone Number', JSON_VALUE(@OldItem,'$.TelephoneNumber'), JSON_VALUE(@NewItem,'$.TelephoneNumber'),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.ContactNumber') <> JSON_VALUE(@OldItem,'$.ContactNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.ContactNumber') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.ContactNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Contact Number', JSON_VALUE(@OldItem,'$.ContactNumber'), JSON_VALUE(@NewItem,'$.ContactNumber'),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.CommunicationType') <> JSON_VALUE(@OldItem,'$.CommunicationType')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.CommunicationType') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.CommunicationType'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Communication Type', (Select [Name] From [common].[CommunicationType] where id = JSON_VALUE(@OldItem,'$.CommunicationType')), (Select [Name] From [common].[CommunicationType] where id = JSON_VALUE(@NewItem,'$.CommunicationType')),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.ContactDesignationType') <> JSON_VALUE(@OldItem,'$.ContactDesignationType')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueBefore = JSON_VALUE(@OldItem,'$.ContactDesignationType') 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.ContactDesignationType'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Contact Designation Type', (Select [Name] From [common].[ContactDesignationType] where id = JSON_VALUE(@OldItem,'$.ContactDesignationType')), (Select [Name] From [common].[ContactDesignationType] where id = JSON_VALUE(@NewItem,'$.ContactDesignationType')),@ItemType)
						 END
					END

				END
				ELSE
				BEGIN
					IF NOT EXISTS (SELECT * FROM ##temp_roleplayerAudit WHERE MemberNumber = @MemberNumber) 

					IF JSON_VALUE(@NewItem,'$.DisplayName') = JSON_VALUE(@NewItem,'$.DisplayName')
					BEGIN
					IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.DisplayName') )
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy,'Member Name', '', JSON_VALUE(@NewItem,'$.DisplayName'),@ItemType)
						 END
					END
					
					IF JSON_VALUE(@NewItem,'$.FinPayeNumber') = JSON_VALUE(@NewItem,'$.FinPayeNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.FinPayeNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy ,'FinPayeNumber', '', JSON_VALUE(@NewItem,'$.FinPayeNumber'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.AccountNumber') = JSON_VALUE(@NewItem,'$.AccountNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.AccountNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy,'Account Number', '', JSON_VALUE(@NewItem,'$.AccountNumber'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.Surname') = JSON_VALUE(@NewItem,'$.Surname')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Surname'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy,'Surname', '', JSON_VALUE(@NewItem,'$.Surname'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.EffectiveDate') = JSON_VALUE(@NewItem,'$.EffectiveDate')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.EffectiveDate'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy ,'Effective Date', '', JSON_VALUE(@NewItem,'$.EffectiveDate'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.AccountHolderName') = JSON_VALUE(@NewItem,'$.AccountHolderName')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.AccountHolderName'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy ,'Account Holder Name', '', JSON_VALUE(@NewItem,'$.AccountHolderName'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.BranchCode') = JSON_VALUE(@NewItem,'$.BranchCode')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.BranchCode'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy ,'Branch Code', '', JSON_VALUE(@NewItem,'$.BranchCode'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.IdNumber') = JSON_VALUE(@NewItem,'$.IdNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.IdNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy ,IIF(@ItemType = 'client_Company', 'CompanyRegistrationNumber', 'IdNumber'), '', JSON_VALUE(@NewItem,'$.IdNumber'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.DateOfBirth') = JSON_VALUE(@NewItem,'$.DateOfBirth')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.DateOfBirth'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy ,'Date Of Birth', '', JSON_VALUE(@NewItem,'$.DateOfBirth'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.Name') = JSON_VALUE(@NewItem,'$.Name')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Name'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified,@ModifiedBy ,'Company Name', '', JSON_VALUE(@NewItem,'$.Name'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.ReferenceNumber') = JSON_VALUE(@NewItem,'$.ReferenceNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.ReferenceNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Compensation Fund Registration Number', '', JSON_VALUE(@NewItem,'$.ReferenceNumber'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.CompensationFundReferenceNumber') = JSON_VALUE(@NewItem,'$.CompensationFundReferenceNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.CompensationFundReferenceNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Compensation Fund Reference Number', '', JSON_VALUE(@NewItem,'$.CompensationFundReferenceNumber'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.VatRegistrationNo') = JSON_VALUE(@NewItem,'$.VatRegistrationNo')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.VatRegistrationNo'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Vat Registration No', '', JSON_VALUE(@NewItem,'$.VatRegistrationNo'),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.IndustryId') = JSON_VALUE(@NewItem,'$.IndustryId')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.IndustryId'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Industry Id', '', (Select [Name] From [common].[Industry] where id = JSON_VALUE(@NewItem,'$.IndustryId')),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.IndustryClass') = JSON_VALUE(@NewItem,'$.IndustryClass')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.IndustryClass'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Industry Class', '', (Select [Name] From [common].[IndustryClass] where id = JSON_VALUE(@NewItem,'$.IndustryClass')),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.CompanyLevel') = JSON_VALUE(@NewItem,'$.CompanyLevel')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.CompanyLevel'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Company Level', '', (Select [Name] From [common].[CompanyLevel] where id = JSON_VALUE(@NewItem,'$.CompanyLevel')),@ItemType)
						 END

					END

					IF JSON_VALUE(@NewItem,'$.Title') = JSON_VALUE(@NewItem,'$.Title')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Title'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Title', '', (Select [Name] From [common].[Title] where id = JSON_VALUE(@NewItem,'$.Title')),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.Firstname') = JSON_VALUE(@NewItem,'$.Firstname')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.Firstname'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'First name', '', JSON_VALUE(@NewItem,'$.Firstname'),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.TelephoneNumber') = JSON_VALUE(@NewItem,'$.TelephoneNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.TelephoneNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Telephone Number', '', JSON_VALUE(@NewItem,'$.TelephoneNumber'),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.ContactNumber') = JSON_VALUE(@NewItem,'$.ContactNumber')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.ContactNumber'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Contact Number', '', JSON_VALUE(@NewItem,'$.ContactNumber'),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.CommunicationType') = JSON_VALUE(@NewItem,'$.CommunicationType')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.CommunicationType'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Communication Type', '', (Select [Name] From [common].[CommunicationType] where id = JSON_VALUE(@NewItem,'$.CommunicationType')),@ItemType)
						 END
					END

					IF JSON_VALUE(@NewItem,'$.ContactDesignationType') = JSON_VALUE(@NewItem,'$.ContactDesignationType')
					BEGIN
						 IF NOT EXISTS(SELECT * FROM ##temp_roleplayerAudit WHERE MemberName = @MemberName	AND MemberNumber = @MemberNumber
																	AND ClientType = @ClientType	AND MemberStatus = @MemberStatus
																   AND CompensationFundReferenceNumber = @CompensationFundReferenceNumber AND CompensationFundRegistrationNumber = @CompensationFundRegistrationNumber 
																   AND CompanyRegistrationNumber = @CompanyRegistrationNumber AND DateCreated = @DateCreated 
																   AND CreatedBy = @CreatedBy AND DateModified = @DateModified 
																   AND ModifiedBy = @ModifiedBy 
																   AND ValueAfter = JSON_VALUE(@NewItem,'$.ContactDesignationType'))
						 BEGIN
							 INSERT INTO ##temp_roleplayerAudit (MemberName, MemberNumber, ClientType, MemberStatus,CompensationFundReferenceNumber, CompensationFundRegistrationNumber, CompanyRegistrationNumber, [Action],DateCreated,CreatedBy, DateModified,ModifiedBy,FieldUpdated, ValueBefore, ValueAfter,ItemType)
								VALUES(@MemberName, @MemberNumber, @ClientType, @MemberStatus, @CompensationFundReferenceNumber, @CompensationFundRegistrationNumber, @CompanyRegistrationNumber,@Action,@DateCreated, @CreatedBy,@DateModified, @ModifiedBy,'Contact Designation Type', '', (Select [Name] From [common].[ContactDesignationType] where id = JSON_VALUE(@NewItem,'$.ContactDesignationType')),@ItemType)
						 END
					END
				END

				FETCH NEXT FROM cursor_rolePlayer INTO 
				@MemberName,
				@MemberNumber,
				@ClientType,
				@MemberStatus,
				@CompensationFundReferenceNumber,
				@CompensationFundRegistrationNumber ,
				@CompanyRegistrationNumber ,
				@DateCreated ,
				@CreatedBy ,
				@ModifiedBy,
				@DateModified ,
				@Action ,
				@NewItem ,
				@OldItem ,
				@ItemType

		END

		CLOSE cursor_rolePlayer;

		DEALLOCATE cursor_rolePlayer;

		

	IF(@MemberStatusId = 0 OR @MemberStatusId is Null)
	BEGIN
		SELECT DISTINCT * FROM ##temp_roleplayerAudit;
	END
	ELSE IF (@MemberStatusId = 1)
	BEGIN
	--Active
	SELECT DISTINCT * FROM ##temp_roleplayerAudit WHERE MemberStatus = 'Active'
	END 
	ELSE IF (@MemberStatusId = 2)
	BEGIN 
	--Active No Policies
	SELECT DISTINCT * FROM ##temp_roleplayerAudit WHERE MemberStatus = 'Active - No policies'
	END

END