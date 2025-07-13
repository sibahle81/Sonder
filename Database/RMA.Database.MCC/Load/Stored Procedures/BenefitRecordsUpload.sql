CREATE procedure [Load].[BenefitRecordsUpload] 
	@fileIdentifier uniqueidentifier, 
	@benefitName varchar(50),
	@rowNumber varchar(50),
	@UserId int,
	@FileName varchar(100)
As begin

--Declare @fileIdentifier uniqueidentifier, 
--	@benefitName varchar(50),
--	@rowNumber varchar(50),
--	@UserId int,
--	@FileName varchar(100)

--Set @fileIdentifier = 'D7C73E97-D974-4F6F-82E0-E06C82CF5C1C'
--Set @benefitName = 'Temporary Total Disablement1 (TTD)'
--Set @rowNumber = '3'
--Set @UserId = 2935
--Set @FileName = 'ImportLeads1.xlsx'

	Delete from [Load].[BenefitsUploadErrorAudit]

	Declare @errors table (
		[FileIdentifier] varchar(512),
		[ErrorCategory] varchar(64),
		[ErrorMessage] varchar(1024),
		[BenefitName] varchar(100),
		[ExcelRowNumber] varchar(100)
	)

	Declare @documentNumbers table (
		[Id] int,
		[Name] varchar(50),
		[NextNumber] int,
		[Format] varchar(50),
		[PrefixSuffixLength] int,
		[IsDataBound] bit,
		[GenerationDate] datetime
	)
	
	Declare @productsTable table (
		[RowID] int IDENTITY(1, 1), 
		[LeadId] int,
		[FileIdentifier] varchar(512),
		[MemberName] varchar(150),
		[Product] varchar(30),
		[ProductOption] varchar(30),
		[ExcelRowNumber] varchar(10)
	)

	Declare @NumberRecords int, @RowCounter int
	Declare @Product varchar(30), @ExcelRowNumber varchar(10)

	Declare @userName varchar(50),
			@benefitId varchar(50),
			@benefitType varchar(50),
			@benefitTypeId int,
			@coverMemberType varchar(50),
			@startDate date,
			@endDate date,
			@minCompensation decimal(18,2),
			@maxCompensation decimal(18,2),
			@excessAmount decimal(18,2),
			@productId int,
			@benefitCode nvarchar(50),
			@coverMemberTypeId Int,
			@notes varchar(Max)

	Select 
		@benefitType = BenefitType,
		@product = Product,
		@coverMemberType = CoverMemberType,
		@startDate = StartDate,
		@endDate = EndDate,
		@minCompensation = MinCompensation,
		@maxCompensation = MaxCompensation,
		@excessAmount = ExcessAmount,
		@notes = Notes
		from [Load].[Benefit] where FileIdentifier = @fileIdentifier And BenefitName = @benefitName And ExcelRowNumber = @rowNumber

	Select @userName = Email From [security].[User] where Id= @UserID
	--set @userName = 'ryan@randmutual.co.za'
	--print @userName

	-- check Benefit Name
	--If Not Exists(Select * from [Common].[BenefitName] where [Name] = @benefitName)
	--	Begin
	--		Insert into @errors values(@fileIdentifier,'Benefit Name','invalid Benefit Name', @benefitName, @rowNumber)
	--	End

	If Exists(Select * from [Product].[Benefit] where [Name] = @benefitName)
		Begin
			Insert into @errors values(@fileIdentifier,'Benefit Name','Benefit already exist', @benefitName, @rowNumber)
		End

	-- check Benefit Type
	IF Not Exists(Select * from [common].[BenefitType] where [Name] = @benefitType)
		Begin
			Insert into @errors values(@fileIdentifier,'Benefit Type','Invalid Benefit Type', @benefitType, @rowNumber)
		End

	-- Check Product
	IF Not Exists(Select * from [Product].[Product] PR where PR.[Name] = @Product)
		Begin
			Insert into @errors values(@fileIdentifier,'Product','Invalid Product', @product, @rowNumber)
		End

	-- Check Cover Member type
	IF Not Exists(Select * from [common].[CoverMemberType] CMT where CMT.[Name] = @coverMemberType)
		Begin
			Insert into @errors values(@fileIdentifier,'Cover Member Type','Invalid Cover Member Type', @coverMemberType, @rowNumber)
		End

	-- Compare Start Date And End Date
	IF @startDate > @endDate
		Begin
			Insert into @errors values(@fileIdentifier,'Start Date And End Date','Start Date must be less than End Date', @benefitName, @rowNumber)
		End

	-- Compare MinCompensation and MaxCompensation
	IF @minCompensation > @maxCompensation
		Begin
			Insert into @errors values(@fileIdentifier,'Compensation Amount','Min Compensation cannot be more than Max Compensation', @benefitName, @rowNumber)
		End

	
	IF EXISTS (SELECT TOP 1 * FROM @errors where FileIdentifier = @fileIdentifier) 
		BEGIN
			INSERT INTO [Load].[BenefitsUploadErrorAudit] ([FileIdentifier],[FileName],[BenefitName],[ErrorCategory], [ErrorMessage],[ExcelRowNumber],[CreatedDate])
			SELECT DISTINCT [FileIdentifier],@FileName,[BenefitName], [ErrorCategory], [ErrorMessage],[ExcelRowNumber],GETDATE() FROM @errors
			ORDER BY [ErrorCategory], [ErrorMessage]
		END
	ELSE
		BEGIN
			Insert into @documentNumbers EXEC [Common].[GetReferenceNumber] @DocumentType = 'Benefit'
			
			Select @benefitId = NextNumber FROM @documentNumbers where [Name] = 'Benefit'
			Select @productId = [Id] From [Product].[Product] where [Name] = @product
			Select @benefitTypeId = [Id] From [common].[BenefitType] where [Name] = @benefitType
			Select @coverMembertypeId = [Id] From [common].[CoverMemberType] where [Name] = @coverMemberType
			
			Set @benefitCode = 'BEN:' + @benefitId

			Insert into [Product].Benefit ([Name],[Code],[StartDate],[EndDate],[IsCaptureEarnings],[IsAddBeneficiaries],[IsMedicalReportRequired],[ProductId],[BenefitTypeId],[CoverMemberTypeId],
											[MinCompensationAmount],[MaxCompensationAmount],[ExcessAmount],[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate])
			values (@benefitName,@benefitCode,@startDate,@endDate,0,0,0,@productId,@benefitTypeId,@coverMemberTypeId,@minCompensation,@maxCompensation,@excessAmount,0,@userName,GETDATE(),@userName,GETDATE())
			
			--INSERT INTO [Load].[BenefitsUploadErrorAudit] ([FileIdentifier],[FileName],[BenefitName],[ErrorCategory], [ErrorMessage],[ExcelRowNumber],[CreatedDate])
			--	VALUES(@fileIdentifier,@FileName,@benefitName,'Success','Uploaded successfully',@rowNumber,GETDATE())
		END


End