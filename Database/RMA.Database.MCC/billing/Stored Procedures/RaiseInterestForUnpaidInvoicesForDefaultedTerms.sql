
-- =============================================
-- Author:		Go-molemo Bojosi
-- Create date: 2023-04-13
-- Description:	Raises interest on overdue invoices For defaulted Terms
-- =============================================
CREATE PROCEDURE [billing].[RaiseInterestForUnpaidInvoicesForDefaultedTerms] 
AS
BEGIN
	 BEGIN TRY

	DECLARE  @interestReferenceNumber varchar(50)
	DECLARE @NextRefID INT 
	 declare @paddedNextRef varchar(max) 
	declare @unpaidInvoices table (invoiceNumber nvarchar(200), invoiceId int, transactionId int , termArrangementId int, roleplayerId int, balance decimal(18, 2), invoiceDate date)
	declare @currentPeriodPostingDate date =(select enddate from common.[period] where status ='current')
	declare @currentPeriodPostingId int =(select id from common.[period] where status ='current')
	
	insert into @unpaidInvoices
	select distinct  i.InvoiceNumber,i.invoiceId ,bt.TransactionId ,t.TermArrangementId, t.RolePlayerId, dbo.GetTransactionBalance(bt.transactionId) balance, i.invoicedate
	 from billing.TermArrangement t
	join billing.Transactions bt on bt.RolePlayerId = t.RolePlayerId 
	join billing.Invoice i on i.invoiceid = bt.invoiceid and i.totalinvoiceamount = bt.amount
	join billing.industryFinancialYear ify on ify.industryfinancialyearId = t.financialYearId
	join policy.Policy pp on pp.policyid = i.policyid

	join client.FinPayee cf (nolock) on cf.RolePlayerId = pp.PolicyPayeeId
	join common.Industry ind  on ind.id = cf.IndustryId
	join common.IndustryClass ic   on ind.IndustryClassId= ic.Id and ic.id = ify.IndustryClassId
	join product.ProductOption po  (nolock) on po.id = pp.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1	
	where 
	t.TermArrangementStatusId = 5
	and t.InterestProcessed = 0
	and i.InvoiceDate between CAST(Concat(ify.StartYear , '-', ify.StartMonth, '-',ify.StartDay ) As date) 
	and CAST(Concat(ify.EndYear , '-', ify.EndMonth, '-', ify.EndDay) As date)
	and t.IsDeleted <> 1 and t.IsActive=1
	and bt.TransactionTypeId =6

	delete @unpaidInvoices where balance =0	

	declare @minInterestMonth datetime = (select top 1 min(dateadd(m,1, invoiceDate)) from @unpaidInvoices)
	declare @maxInterestMonth datetime = (select top 1 max(dateadd(m,1, invoiceDate)) from @unpaidInvoices)
	declare @maxInterestMonthEndDate datetime = (select EOMONTH(@maxInterestMonth))
			
	declare @primeRates table (id int identity(1,1),interestRate int, startDate datetime, endDate datetime)
		
	 insert into  @primeRates
	 select [value],startDate,endDate from common.primerate where 
	 IsActive =1
	 order by startdate 	

	-- select * from @unpaidInvoices
	 
	 --select * from @primeRates
	 
While (Select Count(*) From @unpaidInvoices) > 0
	begin
			
			declare @termArrangementId int
			declare @id int = (select top 1 invoiceId from  @unpaidInvoices )
			declare @invoiceDt datetime =(select invoiceDate from @unpaidInvoices  where invoiceId = @id)

			declare @backDatingStartDate date =  (select DATEADD(m,1, @invoiceDt))


			declare @backDatingEndDate date =  (select EOMONTH(DATEADD(month, -1, GETDATE()))) --dont include current month

			while @backDatingStartDate < @backDatingEndDate
			begin --inner loop for the different months 

			declare @monthInterestIsRaisedFor datetime =  @backDatingStartDate
			declare @effectiveDate datetime = (select EOMONTH(@monthInterestIsRaisedFor))	
			declare @invoiceYear int = (select year(@backDatingStartDate))	
			declare @endOfMonthInterestIsRaisedFor int = (select(day((select EOMONTH(@monthInterestIsRaisedFor)))))		
			declare @numberOfInterestDays int =0
			declare @numberOfDaysPerYear int;
			--number of days in the year invoice was raised
			set @numberOfDaysPerYear = ( SELECT DATEDIFF(day,  cast(@invoiceYear as char(4)),  cast(@invoiceYear+1 as char(4))) Days)			
			
			declare @thisInvoicePrimeRatesWithPotentialDuplicates table (id int, interestRate int, startDate datetime, endDate datetime)
			declare @thisInvoicePrimeRates table (id int, interestRate int, startDate datetime, endDate datetime)
			
			declare @monthInterestIsRaisedForEnding datetime= (select EOMONTH(@monthInterestIsRaisedFor))
			
			declare @minPrimeStartDate datetime = (select top 1 min(startDate) from @primeRates where (@monthInterestIsRaisedFor  between startDate  and endDate))
			declare @maxPrimeEndDate datetime = (select top 1 max(endDate) from @primeRates where @monthInterestIsRaisedForEnding  between startDate  and endDate)			
			set @termArrangementId =(select termArrangementId from @unpaidInvoices where invoiceId = @id)

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
							
						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId  from @unpaidInvoices where invoiceId = @id
						set @balance =(select [dbo].[GetInvoiceBalanceBasedOnDateRange] (@linkedTransactionId, @backDatingStartDate, @effectiveDate) )
								
						set  @interest =  (@balance * (@applicablerate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast((@numberOfDaysPerYear) as decimal(18,2)))
						--more testing required on very old invoices that have number of days greater than 366
											   
					----Reference number--------					
						set	@NextRefID  = (SELECT NextNumber FROM Common.DocumentNumbers d (NOLOCK) WHERE   d.Name = 'Interest')
						 set @paddedNextRef  =  ( select REPLICATE('0', 6 - LEN(@NextRefID))+  cast( @NextRefID as varchar(max)))
						SELECT @interestReferenceNumber = concat( 'IN:',@paddedNextRef)

						----------------------------
					if	@interest < 0
					begin
					set @interest =0
					end
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
					  ,[ModifiedBy],LinkedTransactionId, RmaReference,reason, periodId,IsBackDated,TransactionEffectiveDate,InvoiceId)
						  values (@roleplayerId,1,@interest,@currentPeriodPostingDate,7,Getdate(),Getdate(),'BackendProcess',	'BackendProcess',@linkedTransactionId,@interestReferenceNumber, concat('Interest b/d (', cast( @backDatingStartDate as varchar(15)), '-',cast(FORMAT(@effectiveDate,'yyyy-MM-dd') as varchar(15)) , ') @ ',  @applicablerate, '% over ',@numberOfInterestDays, ' days for: ', @invoiceNumber ),@currentPeriodPostingId,0,@effectiveDate, @id)
						  	
					update billing.TermArrangement  set InterestProcessed = 1, modifieddate =getdate(),modifiedby ='BackendProcess' where termarrangementid = @termArrangementId
				
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
							if @invoicePrimeEndDate < @effectiveDate						
								begin--@invoicePrimeEndDate is the end of our counter
								set	@numberOfInterestDays = DATEDIFF(day,@monthInterestIsRaisedFor, @invoicePrimeEndDate) +1
								end

								-- interest rate ends  month end
							if @invoicePrimeEndDate >= @effectiveDate
								begin --postingdate is the end of our counter
									set	@numberOfInterestDays = DATEDIFF(day,@monthInterestIsRaisedFor, @effectiveDate) +1
								end
							end

								--interest rate started before the month we are looping
							if @invoicePrimeRateStartDate > @monthInterestIsRaisedFor --@invoicePrimeRateStartDate is the start of our counter
							begin
							-- interest rate ends before month end
							if @invoicePrimeEndDate < @effectiveDate
								begin--@invoicePrimeEndDate is the end of our counter
								set	@numberOfInterestDays = DATEDIFF(day,@invoicePrimeRateStartDate, @invoicePrimeEndDate) +1
								end

								-- interest rate ends  month end
							if @invoicePrimeEndDate >= @effectiveDate
								begin --postingdate is the end of our counter
									set	@numberOfInterestDays  = DATEDIFF(day,@invoicePrimeRateStartDate, @effectiveDate) +1
								end
							end							
												
						
						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId from @unpaidInvoices where invoiceId = @id
						set @balance =(select [dbo].[GetInvoiceBalanceBasedOnDateRange] (@linkedTransactionId, @backDatingStartDate, @effectiveDate) )
																	
						set  @interest =  (@balance * (@primeRate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast( (@numberOfDaysPerYear) as decimal(18,2)))
																	
						delete from @thisInvoicePrimeRates where id = @currentInvoicePrimeRateId
						set	@totaldayslooped=@totaldayslooped + @numberOfInterestDays
						set @currentInvoicePrimeRateId  = (select top 1 id from @thisInvoicePrimeRates)

						----Reference number--------					
					set	@NextRefID  = (SELECT NextNumber FROM Common.DocumentNumbers d (NOLOCK) WHERE   d.Name = 'Interest')
						 set @paddedNextRef  =  ( select REPLICATE('0', 6 - LEN(@NextRefID))+  cast( @NextRefID as varchar(max)))
						SELECT @interestReferenceNumber = concat( 'IN:',@paddedNextRef)
						----------------------------

					if	@interest < 0
					begin
					set @interest =0
					end
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
					  ,[ModifiedBy],LinkedTransactionId, RmaReference,reason, periodId,IsBackDated,TransactionEffectiveDate,InvoiceId)
					  	  values (@roleplayerId,1,@interest,@currentPeriodPostingDate,7,Getdate(),Getdate(),'BackendProcess',	'BackendProcess',@linkedTransactionId, @interestReferenceNumber, concat('Interest b/d (', cast( @backDatingStartDate as varchar(15)), '-',cast(FORMAT(@effectiveDate,'yyyy-MM-dd') as varchar(15)) , ') @ ',  @primeRate, '% over ',@numberOfInterestDays, ' days for: ',@invoiceNumber ),@currentPeriodPostingId,0,@effectiveDate, @id)
						 	
						update billing.TermArrangement  set InterestProcessed = 1, modifieddate =getdate(),modifiedby ='BackendProcess' where termarrangementid = @termArrangementId
						
							UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
						SET     NextNumber = NextNumber + 1
						WHERE   Name = 'Interest'; 
						--end	
					end	---end multiple interest rates applied	
			end	
		
			set @backDatingStartDate  =  (select DATEADD(m,1, @backDatingStartDate)) --use this variable to get balance
			end--inner loop for the different months 								
			
			delete @unpaidInvoices where invoiceId = @id	
	end
	   
  END TRY  
  BEGIN CATCH                           
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
 END CATCH  
END