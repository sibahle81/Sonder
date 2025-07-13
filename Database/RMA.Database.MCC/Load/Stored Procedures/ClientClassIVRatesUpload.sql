
CREATE procedure [Load].[ClientClassIVRatesUpload] 
	@fileIdentifier uniqueidentifier, 
	@userId int,
	@fileName varchar(100)
As begin

--Declare @fileIdentifier uniqueidentifier, 
--	@UserId int,
--	@fileName varchar(100)

--	Set @fileIdentifier = 'f36a8d6e-a567-42fe-b47f-9e95e72818b8'
--	Set @UserId = 2935
--	Set @fileName = 'ImportLeads1.xlsx'

	Declare @ClientRates table (
		[RowID] int IDENTITY(1, 1), 
		[FileIdentifier] varchar(50),
		[Product] varchar(30),
		[MemberNo] varchar(150),
		[Category] varchar(150),
		[BenefitSet] varchar(150),
		[RateType] varchar(50),
		[Rate] decimal(10,8),
		[StartDate] Datetime,
		[EndDate] DateTime,
		[ExcelRowNumber] varchar(10)
	)

	Insert into @ClientRates (FileIdentifier,Product,MemberNo,Category,BenefitSet,RateType,Rate,StartDate,EndDate,ExcelRowNumber)
		Select @fileIdentifier,Product,MemberNo,Category,BenefitSet,RateType,Rate,StartDate,EndDate,ExcelRowNumber From [Load].[ClientClass4Rates] Where FileIdentifier = @fileIdentifier

	Declare @NumberRecords int, @RowCounter int, @RowCounterInsert int,@ErrorsCount int
	Declare @Product varchar(30), 
			@ProductOption varchar(30), 
			@ExcelRowNumber varchar(10),
			@ProductOptionId int,
			@ProductId int,
			@userName varchar(50)

	Select @NumberRecords = COUNT(*) FROM @ClientRates
	Select @userName = Email From [security].[User] where Id= @UserID
	Set @RowCounter = 1
	
	While @RowCounter <= @NumberRecords
		Begin
			Declare 
				@isProductValid bit,
				@memberNo varchar(50),
				@ratingYear varchar(50),
				@category int,
				@categoryName varchar(50)

			Set @ProductId = NULL
			Set @ProductOptionId = NULL

			Select @ProductOption = Product FROM @ClientRates Where RowID = @RowCounter
			Select @ProductOptionId = Id from [product].[ProductOption] Where [Name] = @ProductOption
			Select @memberNo = MemberNo from @ClientRates where RowID = @RowCounter
			Select @ExcelRowNumber = ExcelRowNumber from @ClientRates where RowID = @RowCounter
			Select @ratingYear = YEAR(StartDate) from @ClientRates where RowID = @RowCounter
			select @categoryName = Category from @ClientRates where RowID = @RowCounter
			Select @category = Case 
								when Category = 'Other Employees' Then 1 
								when Category = 'Cat 1-8 Employees' Then 2
								when Category = 'Patterson Band D+' Then 1
								Else 1
							End
							from @ClientRates where RowID = @RowCounter

			If (@ProductOptionId = '' OR @ProductOptionId IS NULL)
				Begin
					Insert into [Load].[RatesUploadErrorAudit] (FileIdentifier,[FileName],ErrorCategory,ErrorMessage,ExcelRowNumber,UploadDate)
						values(@fileIdentifier,@fileName,'Product','Product does not exist Or Product is invalid - ' + @ProductOption,@ExcelRowNumber,GETDATE())
				End

			IF Exists(Select top 1 * from client.Rates where Category = @category AND RatingYear = @ratingYear AND MemberNo = @memberNo AND Product = @ProductOption)
			begin 
				Insert into [Load].[RatesUploadErrorAudit] (FileIdentifier,[FileName],ErrorCategory,ErrorMessage,ExcelRowNumber,UploadDate)
						values(@fileIdentifier,@fileName,'Duplicate',@memberNo + ' ' + @ProductOption + ' ' + @categoryName + ' Rate exists for ' + @ratingYear ,@ExcelRowNumber, GETDATE())
			end

			Set @RowCounter = @RowCounter + 1
		END

	Set @RowCounterInsert = 1
	
	IF Not Exists(Select * from [Load].[RatesUploadErrorAudit] where FileIdentifier = @fileIdentifier)
		Begin

		While @RowCounterInsert <= @NumberRecords
			Begin
				Declare @memberNoInsert varchar(30), @startDate Datetime, @endDate Datetime
				Select @memberNoInsert = MemberNo from @ClientRates where RowID = @RowCounterInsert
				Select @startDate = StartDate from @ClientRates where RowID = @RowCounterInsert
				Select @endDate = EndDate from @ClientRates where RowID = @RowCounterInsert
				Select @category = Case when Category = 'Other Employees' Then 1 
											when Category = 'Cat 1-8 Employees' Then 2
											when Category = 'Patterson Band D+' Then 1
											Else 1
										End from @ClientRates where RowID = @RowCounterInsert
				
				IF Not Exists(Select top 1 * from [Client].[Rates] where MemberNo = @memberNoInsert AND StartDate = @StartDate AND EndDate = @endDate AND Category = @category)
				Begin
					
					INSERT INTO [Client].[Rates] (Product, MemberNo, Category, BenefitSet, RateType, Rate, StartDate, EndDate, IndustryGroup, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, RatingYear)
										SELECT Product, MemberNo, 
										Case 
											when Category = 'Other Employees' Then 1 
											when Category = 'Cat 1-8 Employees' Then 2
											when Category = 'Patterson Band D+' Then 1
											Else 1
										End
										,BenefitSet, RateType, Rate, StartDate, EndDate, [CC].IndustryClassId, 0, @userName, GETDATE(), @userName, GETDATE(), YEAR(StartDate) 
										FROM @ClientRates [CR] 
										INNER JOIN [client].[FinPayee] [FP] ON [FP].FinPayeNumber = [CR].MemberNo
										INNER JOIN [client].[Company] [CC] ON [CC].RolePlayerId = [FP].RolePlayerId
										
										where RowID = @RowCounterInsert
				End
				Set @RowCounterInsert = @RowCounterInsert + 1
			END

		End

End