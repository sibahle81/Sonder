
CREATE procedure [Load].[ClientClassXIIIRatesUpload] 
	@fileIdentifier uniqueidentifier, 
	@industryClass int,
	@userId int,
	@FileName varchar(100)
As begin

--Declare @fileIdentifier uniqueidentifier, 
--	@industryClass int,
--	@UserId int,
--	@FileName varchar(100)

--	Set @fileIdentifier = '0BF99836-59B9-4C60-B32C-9578A6A4A8FC'
--	Set @industryClass = 2
--	Set @UserId = 2935
--	Set @FileName = 'ImportLeads1.xlsx'

	Declare @errors table (
		[FileIdentifier] varchar(512),
		[ErrorCategory] varchar(64),
		[ErrorMessage] varchar(1024),
		[MemberNo] varchar(100),
		[ExcelRowNumber] varchar(100)
	)

	Declare @ClientRates table (
		[RowID] int IDENTITY(1, 1), 
		[FileIdentifier] varchar(50),
		[Product] varchar(30),
		[RefNo] varchar(150),
		[CompanyName] varchar(150),
		[ExcelRowNumber] varchar(10),
		[LoadDate] datetime,
		[Industry] varchar(150),
		[IndustryClass] int,
		[IndRate] decimal(10,8),
		[PremRate] decimal(10,8),
		[GPLimited] decimal(10,8),
		[FinalRate] decimal(10,8),
		[DiscountOrLoading] decimal(10,8),
		[DiscountOrLoadingStatus] varchar(50),
		[RatingYear] int
	)

	Insert into @ClientRates (FileIdentifier,Product,RefNo,CompanyName,ExcelRowNumber,LoadDate,Industry,IndustryClass,IndRate,PremRate,GPLimited,FinalRate,DiscountOrLoading,DiscountOrLoadingStatus,RatingYear)
		Select @fileIdentifier,Product,RefNo,CompanyName,ExcelRowNumber,LoadDate,Industry,@industryClass,IndRate,PremRate,GPLimited,FinalRate,DiscountOrLoading,DiscountOrLoadingStatus,RatingYear
		From [Load].[ClientClass13Rates] Where FileIdentifier = @fileIdentifier

	Declare @NumberRecords int, @RowCounter int, @RowCounterInsert int,@ErrorsCount int
	Declare @Product varchar(30), 
			@ProductOption varchar(30), 
			@ExcelRowNumber varchar(10),
			@ProductOptionId int,
			@ProductId int,
			@RefNo varchar(50),
			@userName varchar(50)
	Select @NumberRecords = COUNT(*) FROM @ClientRates
	Set @RowCounter = 1
	Select @userName = Email From [security].[User] where Id= @UserID

	While @RowCounter <= @NumberRecords
		Begin
			Declare @isProductValid bit,@memberNo varchar(30)
			Set @ProductId = NULL
			Set @ProductOptionId = NULL
			--Print 'Row Counter - '  print @RowCounter
			Select @ProductOption = Product FROM @ClientRates Where RowID = @RowCounter
			Select @ProductOptionId = Id from [product].[ProductOption] Where [Name] = @ProductOption
			Select @ExcelRowNumber = ExcelRowNumber from @ClientRates where RowID = @RowCounter
			Select @RefNo = RefNo from @ClientRates where RowID = @RowCounter

			If @ProductOptionId = '' OR @ProductOptionId IS NULL
				Begin
					Insert into @errors values(@fileIdentifier,'Product','Product does not exist Or Product is invalid - ' + @ProductOption ,@memberNo,@ExcelRowNumber)
					Insert into [Load].[ClientRateUploadErrorAudit] (FileIdentifier,[FileName],IndustryClassId,MemberNo,RefNo,ErrorCategory,ErrorMessage,ExcelRowNumber,CreatedDate)
						values(@fileIdentifier,@FileName,@IndustryClass,NULL,@RefNo,'Product','Product does not exist Or Product is invalid - ' + @ProductOption,@ExcelRowNumber,GETDATE())
				End

			Set @RowCounter = @RowCounter + 1
		END

	Set @RowCounterInsert = 1
	IF Not Exists(Select * from [Load].[ClientRateUploadErrorAudit] where FileIdentifier = @fileIdentifier)
		Begin
			--INSERT INTO [Client].[Rates] (Category,RefNo,CompanyName,Industry,IndustryGroup,IndRate,PremRate,GPLimited,FinalRate,DiscountOrLoading,DiscountOrLoadingStatus,RatingYear,LoadDate,Product,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)
			--SELECT 2,RefNo,CompanyName,Industry,@industryClass,IndRate,PremRate,GPLimited,FinalRate,DiscountOrLoading,DiscountOrLoadingStatus,RatingYear,LoadDate,Product,0,@userName,GETDATE(),@userName,GETDATE() FROM [Load].[ClientClass13Rates] where FileIdentifier = @fileIdentifier

			While @RowCounterInsert <= @NumberRecords
			Begin
				Declare @memberNoInsert varchar(30), @startDate Datetime, @productInsert varchar(50)
				Select @memberNoInsert = RefNo from @ClientRates where RowID = @RowCounterInsert
				Select @startDate = LoadDate from @ClientRates where RowID = @RowCounterInsert
				Select @productInsert = Product from @ClientRates where RowID = @RowCounterInsert
				
				IF Not Exists(Select top 1 * from [Client].[Rates] where RefNo = @memberNoInsert AND LoadDate = @StartDate AND Product = @productInsert)
				Begin
					
					INSERT INTO [Client].[Rates] (MemberNo, Category,Rate, RefNo, CompanyName,Industry,IndustryGroup,IndRate,PremRate,GPLimited,FinalRate,DiscountOrLoading,DiscountOrLoadingStatus,RatingYear,LoadDate,Product,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)
					SELECT RefNo, 2,FinalRate,RefNo,CompanyName,Industry,IndustryClass,IndRate,PremRate,GPLimited,FinalRate,DiscountOrLoading,DiscountOrLoadingStatus,RatingYear,LoadDate,Product,0,@userName,GETDATE(),@userName,GETDATE() FROM @ClientRates where RowID = @RowCounterInsert

				End
				Set @RowCounterInsert = @RowCounterInsert + 1
			END

		End
End