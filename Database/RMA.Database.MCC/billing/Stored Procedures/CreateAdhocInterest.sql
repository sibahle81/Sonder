
-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023-04-13
-- Description:	Raises Adhoc interest
-- =============================================

CREATE PROCEDURE [billing].[CreateAdhocInterest]  --259982,'2022/08/31 00:00:00;2022/09/30 00:00:00','2023/07/20 16:29:36','bmakelane@randmutual.co.za'
@invoiceId int,
@interestDates varchar(max),
@currentPeriodPostingDate date,
@user varchar(max)
AS
BEGIN
	declare @interestDatesToCreate table (Id int identity(1,1),interestDate date)	

	 BEGIN TRY
	declare @unpaidInvoices table (invoiceNumber nvarchar(200), invoiceId int, transactionId int , roleplayerId int, balance decimal(18, 2), invoiceDate date)

	insert into @unpaidInvoices
	select i.InvoiceNumber,i.invoiceId ,bt.TransactionId ,bt.roleplayerid,  dbo.GetTransactionBalance(bt.transactionId) balance, i.invoicedate
	 from billing.invoice i
	join billing.Transactions bt on bt.invoiceid =i.InvoiceId
	where i.InvoiceId=@invoiceId
	 declare @splitDates table(id int identity, [value] nvarchar(20)) 

    insert into  @splitDates (value)
    Select VALUE FROM STRING_SPLIT(@interestDates, ';')
	
	declare @currentMonthEndForPosting date=  @currentPeriodPostingDate
	declare @minInterestMonth datetime = (select top 1 min(dateadd(m,1, [value])) from @splitDates)
	declare @maxInterestMonth datetime = (select top 1 max(dateadd(m,1, [value])) from @splitDates)
	declare @maxInterestMonthEndDate datetime = (select EOMONTH(@maxInterestMonth))
	declare @currentPeriodPostingId int =(select id from common.[period] where status ='current')
			
	declare @primeRates table (id int identity(1,1),interestRate int, startDate datetime, endDate datetime)
		
	 insert into  @primeRates
	 select [value],startDate,endDate from common.primerate where 
	 IsActive =1
	 order by startdate 		
	 
While (Select Count(*) From @splitDates) > 0
	begin			
			declare @id int = (select top 1 id from  @splitDates )

			declare @interestMonthDate datetime =(select cast([value]  as date) from @splitDates  where id = @id)

			declare @startOfTheMonth date =(SELECT DATEFROMPARTS(YEAR(@interestMonthDate),MONTH(@interestMonthDate),1))
			DECLARE  @interestReferenceNumber varchar(50)
			DECLARE @NextRefID INT 
			declare @paddedNextRef varchar(max)
								
			declare @monthInterestIsRaisedFor datetime =  @interestMonthDate
			declare @postingDate datetime = (select EOMONTH(@monthInterestIsRaisedFor))	
			declare @invoiceYear int = (select year(@interestMonthDate))	
			declare @endOfMonthInterestIsRaisedFor int = (select(day((select EOMONTH(@monthInterestIsRaisedFor)))))		
			declare @numberOfInterestDays int =0
			declare @numberOfDaysPerYear int;
			--number of days in the year invoice was raised
			set @numberOfDaysPerYear = ( SELECT DATEDIFF(day,  cast(@invoiceYear as char(4)),  cast(@invoiceYear+1 as char(4))) Days)
			
			declare @numberOfDaysInPostingDate int = (select (DAY(DATEADD(DD,-1,DATEADD(MM,DATEDIFF(MM,-1,@interestMonthDate),0)))) )

			declare @thisInvoicePrimeRatesWithPotentialDuplicates table (id int, interestRate int, startDate datetime, endDate datetime)
			declare @thisInvoicePrimeRates table (id int, interestRate int, startDate datetime, endDate datetime)
			
			declare @monthInterestIsRaisedForEnding datetime= (select EOMONTH(@monthInterestIsRaisedFor))
			
			declare @minPrimeStartDate datetime = (select top 1 min(startDate) from @primeRates where (@monthInterestIsRaisedFor  between startDate  and endDate))
			declare @maxPrimeEndDate datetime = (select top 1 max(endDate) from @primeRates where @monthInterestIsRaisedForEnding  between startDate  and endDate)			
		
			insert into @thisInvoicePrimeRatesWithPotentialDuplicates
			select  id,interestRate,startDate,endDate from @primeRates where startDate >= @minPrimeStartDate
			and endDate  <=@maxPrimeEndDate order by id 			
			
			--remove duplicates
				insert into @thisInvoicePrimeRates
				select distinct * from  @thisInvoicePrimeRatesWithPotentialDuplicates d
				where 	not exists(select 1 from @thisInvoicePrimeRates where id=d.id) 
				order by id 

			declare @applicableInterestRates int = (select count(id) from @thisInvoicePrimeRates)
			
			declare @invoiceNumber nvarchar(200)
						declare @linkedTransactionId int
						declare @balance decimal(18,2)
						declare @roleplayerId int

			if @applicableInterestRates = 1
			begin---single interest rate applied
			declare @interest decimal(18,2)
						set @numberOfInterestDays =@endOfMonthInterestIsRaisedFor
						declare @applicablerate  decimal(18,2) = (select top 1 interestRate from @thisInvoicePrimeRates)
							
						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId  from @unpaidInvoices 
						set @balance =(select [dbo].[GetInvoiceBalanceBasedOnDateRange] (@linkedTransactionId, @startOfTheMonth, @interestMonthDate) )
								
						set  @interest =  (@balance * (@applicablerate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast((@numberOfDaysPerYear) as decimal(18,2)))
						
						----Reference number--------					
						set	@NextRefID  = (SELECT NextNumber FROM Common.DocumentNumbers d (NOLOCK) WHERE   d.Name = 'Interest')
						 set @paddedNextRef  =  ( select REPLICATE('0', 6 - LEN(@NextRefID))+  cast( @NextRefID as varchar(max)))
						SELECT @interestReferenceNumber = concat( 'IN:',@paddedNextRef)
						----------------------------
						--more testing required on very old invoices that have number of days greater than 366
						--if @numberOfInterestDays > 0 and @numberOfInterestDays <=31	
						--begin			
						insert into billing.[Transactions] (
					  [RolePlayerId]
					  ,[TransactionTypeLinkId]
					  ,[Amount]
					  ,[TransactionDate]
					  ,[TransactionTypeId]
					  ,[CreatedDate]
					  ,[ModifiedDate]
					  ,[CreatedBy]
					  ,[ModifiedBy],LinkedTransactionId, RmaReference,reason, PeriodId,IsBackDated,TransactionEffectiveDate, InvoiceId)
						  values (@roleplayerId,1,@interest,@currentMonthEndForPosting,7,Getdate(),Getdate(),@user,	@user,@linkedTransactionId
						  , @interestReferenceNumber, concat('Adhoc Interest (', cast( @interestMonthDate as varchar(11)), ') @ ',  @applicablerate, '% over ',@numberOfInterestDays, ' days for: ', @invoiceNumber ) ,@currentPeriodPostingId,1,@interestMonthDate, @invoiceId)
						 
						insert into billing.note values(@roleplayerId,'AdhocInterest',concat('Created for ',cast( @interestMonthDate as varchar(11)), ' amount of ',@interest, ' Doc- ', @interestReferenceNumber),1,0,@user,Getdate(),@user,Getdate() )
						
						UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
						SET     NextNumber = NextNumber + 1
						WHERE   Name = 'Interest'; 
				
				--end
			end---end single interest rate applied

			else if  @applicableInterestRates > 1
			begin---multiple interest rates applied
			declare @lastItem int = (select max(id) from @thisInvoicePrimeRates)
			declare @totaldayslooped int = 0
			declare @currentInvoicePrimeRateId int = (select top 1 id from @thisInvoicePrimeRates)
					while (select count(id) from @thisInvoicePrimeRates) > 0
						begin
						
						declare @primeRate decimal(18,2) =(select top 1 interestRate from @thisInvoicePrimeRates where 
						id = @currentInvoicePrimeRateId)

							declare @invoicePrimeRateStartDate datetime =(select startDate from @thisInvoicePrimeRates where 
							id = @currentInvoicePrimeRateId)
							
							declare @invoicePrimeEndDate datetime =(select endDate from @thisInvoicePrimeRates where 
							id = @currentInvoicePrimeRateId)

							if @invoicePrimeEndDate < @monthInterestIsRaisedFor
							 begin
							 	delete from @thisInvoicePrimeRates where id = @currentInvoicePrimeRateId
								set	@totaldayslooped=@totaldayslooped + @numberOfInterestDays
								set @currentInvoicePrimeRateId  = (select top 1 id from @thisInvoicePrimeRates)
								 continue; 
							 end 
							
							--interest rate started before the month we are looping
							if @invoicePrimeRateStartDate <= @monthInterestIsRaisedFor --@monthInterestIsRaisedFor is the start of our counter
							begin
							-- interest rate ends before month end
							if @invoicePrimeEndDate < @postingDate						
								begin--@invoicePrimeEndDate is the end of our counter
								set	@numberOfInterestDays = DATEDIFF(day,@monthInterestIsRaisedFor, @invoicePrimeEndDate) +1
								end

								-- interest rate ends  month end
							if @invoicePrimeEndDate >= @postingDate
								begin --postingdate is the end of our counter
									set	@numberOfInterestDays = DATEDIFF(day,@monthInterestIsRaisedFor, @postingDate) +1
								end
							end

								--interest rate started before the month we are looping
							if @invoicePrimeRateStartDate > @monthInterestIsRaisedFor --@invoicePrimeRateStartDate is the start of our counter
							begin
							-- interest rate ends before month end
							if @invoicePrimeEndDate < @postingDate
								begin--@invoicePrimeEndDate is the end of our counter
								set	@numberOfInterestDays = DATEDIFF(day,@invoicePrimeRateStartDate, @invoicePrimeEndDate) +1
								end

								-- interest rate ends  month end
							if @invoicePrimeEndDate >= @postingDate
								begin --postingdate is the end of our counter
									set	@numberOfInterestDays  = DATEDIFF(day,@invoicePrimeRateStartDate, @postingDate) +1
								end
							end							
												
						
						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId from @unpaidInvoices 
						set @balance =(select [dbo].[GetInvoiceBalanceBasedOnDateRange] (@linkedTransactionId, @startOfTheMonth, @interestMonthDate) )
						
											
						set  @interest =  (@balance * (@primeRate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast( (@numberOfDaysPerYear) as decimal(18,2)))
																	
						delete from @thisInvoicePrimeRates where id = @currentInvoicePrimeRateId
						set	@totaldayslooped=@totaldayslooped + @numberOfInterestDays
						set @currentInvoicePrimeRateId  = (select top 1 id from @thisInvoicePrimeRates)

						----Reference number--------					
						set	@NextRefID  = (SELECT NextNumber FROM Common.DocumentNumbers d (NOLOCK) WHERE   d.Name = 'Interest')
						 set @paddedNextRef  =  ( select REPLICATE('0', 6 - LEN(@NextRefID))+  cast( @NextRefID as varchar(max)))
						SELECT @interestReferenceNumber = concat( 'IN:',@paddedNextRef)
						----------------------------													
						--if @numberOfInterestDays > 0 and @numberOfInterestDays <=31
						--begin
						--more testing required on very old invoices that have number of days greater than 366
					insert into billing.[Transactions] (
					  [RolePlayerId]
					  ,[TransactionTypeLinkId]
					  ,[Amount]
					  ,[TransactionDate]
					  ,[TransactionTypeId]
					  ,[CreatedDate]
					  ,[ModifiedDate]
					  ,[CreatedBy]
					  ,[ModifiedBy],LinkedTransactionId, RmaReference,reason, PeriodId,IsBackDated,TransactionEffectiveDate, InvoiceId)
					  	  values (@roleplayerId,1,@interest,@currentMonthEndForPosting,7,Getdate(),Getdate(),@user,	@user,@linkedTransactionId, @interestReferenceNumber , concat('Adhoc Interest (', cast( @interestMonthDate as varchar(11)), ') @ ',  @primeRate, '% over ',@numberOfInterestDays, ' days for: ', @invoiceNumber ) ,@currentPeriodPostingId,1,@interestMonthDate,@invoiceId)
						
						insert into billing.note values(@roleplayerId,'AdhocInterest',concat('Created for ',cast( @interestMonthDate as varchar(11)), ' amount of ',@interest, ' Doc- ', @interestReferenceNumber),1,0,@user,Getdate(),@user,Getdate() )
						
						UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
						SET     NextNumber = NextNumber + 1
						WHERE   Name = 'Interest'; 
						--end	
					end	---end multiple interest rates applied	
			end	
		
			delete @splitDates where id = @id	
	end
	   
  END TRY  
  BEGIN CATCH                           
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
 END CATCH  
END