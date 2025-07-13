
CREATE procedure [Load].[IndustryRatesUpload] 
	@fileIdentifier uniqueidentifier, 
	@userId int,
	@fileName varchar(100)
As begin
-----------------------------------------------------------------------------
--Declare @fileIdentifier uniqueidentifier, 
--	@UserId int,
--	@fileName varchar(100)

--	Set @fileIdentifier = 'F255D0F8-A28A-4237-AE5F-9538376D0641'
--	Set @UserId = 2935
--	Set @fileName = 'IndustryRates.xlsx'
-----------------------------------------------------------------------------

	Declare @RateIndustry table (
		[RowID] int IDENTITY(1, 1), 
		[FileIdentifier] varchar(50),
		[Industry] varchar(50),
		[IndustryGroup] varchar(50),
		[EmployeeCategory] varchar(50),
		[IndustryRate] decimal(18,4),
		[PreviousYear] int,
		[PreviousYearRate] decimal(18,4),
		[RatingYear] int,
		[PremiumPerMember] decimal (18,4),
		[ExcelRowNumber] varchar(50)
	)

	Insert into @RateIndustry (FileIdentifier,Industry,IndustryGroup,EmployeeCategory,IndustryRate,PreviousYear,PreviousYearRate,RatingYear,PremiumPerMember, ExcelRowNumber)
		Select FileIdentifier, Industry, IndustryGroup ,EmployeeCategory, IndustryRate, RatingYear - 1, 0, RatingYear, 0, ExcelRowNumber
		From [Load].[IndustryRates] Where FileIdentifier = @fileIdentifier

		--select * from @RateIndustry

	Declare @NumberRecords int, @RowCounter int, @RowCounterInsert int, @ErrorsCount int
	Declare  
			@ExcelRowNumber varchar(10),
			@userName varchar(50)

	Select @NumberRecords = COUNT(*) FROM @RateIndustry
	Set @RowCounter = 1
	Select @userName = Email From [security].[User] where Id= @UserID

	While @RowCounter <= @NumberRecords
		Begin
			Select @ExcelRowNumber = ExcelRowNumber from @RateIndustry where RowID = @RowCounter

			Declare @ratingYear varchar(50), @industry varchar(50), @industryGroup  varchar(50), @employeeCategory  varchar(50), @skillSubCategoryId int

				Select @ratingYear = ratingYear from @RateIndustry where RowID = @RowCounter
				Select @industry = industry from @RateIndustry where RowID = @RowCounter
				Select @industryGroup = industryGroup from @RateIndustry where RowID = @RowCounter
				Select @employeeCategory = employeeCategory from @RateIndustry where RowID = @RowCounter
				
				IF Exists(Select top 1 * from [common].[RateIndustry] where ratingYear = @ratingYear AND industry = @industry AND industryGroup = @industryGroup AND employeeCategory = @employeeCategory)
				begin
					Insert into [Load].[RatesUploadErrorAudit] (FileIdentifier,[FileName],ErrorCategory,ErrorMessage,ExcelRowNumber,UploadDate)
						values(@fileIdentifier, @fileName,'Duplicate',@industry + ' ' + @industryGroup + ' ' + @employeeCategory + ' Rate has already been upladed for ' + @ratingYear, @ExcelRowNumber, GETDATE())
				end

			Set @RowCounter = @RowCounter + 1
		END

	Set @RowCounterInsert = 1
	IF Not Exists(Select * from [Load].[RatesUploadErrorAudit] where FileIdentifier = @fileIdentifier)
		Begin
			While @RowCounterInsert <= @NumberRecords
			Begin
				Select @ratingYear = ratingYear from @RateIndustry where RowID = @RowCounterInsert
				Select @industry = industry from @RateIndustry where RowID = @RowCounterInsert
				Select @industryGroup = industryGroup from @RateIndustry where RowID = @RowCounterInsert
				Select @employeeCategory = employeeCategory from @RateIndustry where RowID = @RowCounterInsert
				
				select @skillSubCategoryId = CASE WHEN @employeeCategory = 'Skilled' THEN 1 ELSE 2 END

				INSERT INTO  [common].[RateIndustry]  (SkillSubCategoryId, Industry, IndustryGroup,EmployeeCategory,IndustryRate,PreviousYear,PreviousYearRate,RatingYear,PremiumPerMember,IsActive,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)
				SELECT @skillSubCategoryId,@industry,@industryGroup,EmployeeCategory,IndustryRate,PreviousYear,PreviousYearRate,RatingYear,PremiumPerMember,1,0,@userName,GETDATE(),@userName,GETDATE() FROM @RateIndustry where RowID = @RowCounterInsert

				Set @RowCounterInsert = @RowCounterInsert + 1
			END

		End
End