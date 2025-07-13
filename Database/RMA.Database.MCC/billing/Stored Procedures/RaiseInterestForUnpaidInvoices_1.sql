
-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023-01-03
-- Description:	Raises interest on overdue invoices
-- =============================================
CREATE PROCEDURE [billing].[RaiseInterestForUnpaidInvoices] 
AS
BEGIN

	 BEGIN TRY
	declare @tempunpaidInvoices table (invoiceNumber nvarchar(200), transactionId int, balance decimal(18,2),invoiceId int, roleplayerId int, invoiceDate datetime)
	declare @unpaidInvoices table (invoiceNumber nvarchar(200), transactionId int, balance decimal(18,2),invoiceId int, roleplayerId int, invoiceDate datetime)
	declare @endOfCurrentMonth int = (select(day((select EOMONTH(getdate())))))
	declare   @numberOfDays int = -(select(day((select EOMONTH(getdate())))))
	declare @currentPeriodPostingDate date =(select enddate from common.[period] where status ='current')
	declare @currentPeriodPostingId int =(select id from common.[period] where status ='current')

	---monthly
	insert into @tempunpaidInvoices
	select  top 200  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	 from billing.invoice i  (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join common.Industry ind  on ind.id = cf.IndustryId
	join common.IndustryClass ic   on ind.IndustryClassId= ic.Id
	join product.ProductOption po  (nolock) on po.id = p.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1
	--exclude items that have active terms
	left join billing.TermArrangement ta on ta.RolePlayerId = cf.RolePlayerId and ta.IsActive = 1 and ta.IsDeleted=0
	left join billing.IndustryFinancialYear ify on ta.FinancialYearId = ify.IndustryFinancialYearId and ic.id = ify.IndustryClassId
	where t.TransactionTypeId = 6
	and i.InvoiceDate < DATEADD(day, cast( @numberOfDays as int), GETDATE())
	and p.PolicyOwnerId = p.PolicyPayeeId
	and p.PaymentFrequencyId = 2
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -30, GETDATE())
	and t2.TransactionTypeId = 7  and t1.InvoiceId is not null) --dont double charge interest in the same month/quarter etc
	and ta.TermArrangementId is null
	---quarterly
	union all 
	select  top 200  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	from billing.invoice i  (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join common.Industry ind   on ind.id = cf.IndustryId
	join common.IndustryClass ic  on ind.IndustryClassId= ic.Id
	join product.ProductOption po  (nolock) on po.id = p.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1
	--exclude items that have active terms
	left join billing.TermArrangement ta on ta.RolePlayerId = cf.RolePlayerId and ta.IsActive = 1 and ta.IsDeleted=0
	left join billing.IndustryFinancialYear ify on ta.FinancialYearId = ify.IndustryFinancialYearId and ic.id = ify.IndustryClassId
	where t.TransactionTypeId = 6
	and i.InvoiceDate < DATEADD(day, cast( @numberOfDays as int), GETDATE())	
	and p.PolicyOwnerId = p.PolicyPayeeId
	and p.PaymentFrequencyId = 3
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -91, GETDATE())
	and t2.TransactionTypeId = 7  and t1.InvoiceId is not null) --dont double charge interest in the same month/quarter etc
	and ta.TermArrangementId is null
	---biannually
	union all
	select  top 200  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	from billing.invoice i   (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join common.Industry ind  on ind.id = cf.IndustryId
	join common.IndustryClass ic   on ind.IndustryClassId= ic.Id
	join product.ProductOption po  (nolock) on po.id = p.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1
	--exclude items that have active terms
	left join billing.TermArrangement ta on ta.RolePlayerId = cf.RolePlayerId and ta.IsActive = 1 and ta.IsDeleted=0
	left join billing.IndustryFinancialYear ify on ta.FinancialYearId = ify.IndustryFinancialYearId and ic.id = ify.IndustryClassId
	where t.TransactionTypeId = 6
	and i.InvoiceDate < DATEADD(day, cast( @numberOfDays as int), GETDATE())	
	and p.PolicyOwnerId = p.PolicyPayeeId
	and p.PaymentFrequencyId = 4 
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -183, GETDATE())
	and t2.TransactionTypeId = 7  and t1.InvoiceId is not null) --dont double charge interest in the same month/quarter etc
	and ta.TermArrangementId is null
	---annually
	union all
	select  top 200  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	from billing.invoice i  (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join common.Industry ind   on ind.id = cf.IndustryId
	join common.IndustryClass ic   on ind.IndustryClassId= ic.Id
	join product.ProductOption po  (nolock) on po.id = p.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1
	--exclude items that have active terms
	left join billing.TermArrangement ta on ta.RolePlayerId = cf.RolePlayerId and ta.IsActive = 1 and ta.IsDeleted=0
	left join billing.IndustryFinancialYear ify on ta.FinancialYearId = ify.IndustryFinancialYearId and ic.id = ify.IndustryClassId
	where t.TransactionTypeId = 6
	and i.InvoiceDate < DATEADD(day, cast( @numberOfDays as int), GETDATE())	
	and p.PolicyOwnerId = p.PolicyPayeeId
	and p.PaymentFrequencyId = 1 
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -365, GETDATE())
	and t2.TransactionTypeId = 7  and t1.InvoiceId is not null) --dont double charge interest in the same month/quarter etc
	and ta.TermArrangementId is null	

	delete @tempunpaidInvoices where balance =0

	insert into @unpaidInvoices
	select distinct * from  @tempunpaidInvoices
	
	declare @minInterestMonth datetime = (select top 1 min(dateadd(m,1, invoiceDate)) from @unpaidInvoices)
	declare @maxInterestMonth datetime = (select top 1 max(dateadd(m,1, invoiceDate)) from @unpaidInvoices)
	declare @maxInterestMonthEndDate datetime = (select EOMONTH(@maxInterestMonth))
			
	declare @primeRates table (id int identity(1,1),interestRate int, startDate datetime, endDate datetime)
		
	 insert into  @primeRates
	 select [value],startDate,endDate from common.primerate where 
	 IsActive =1
	 order by startdate 	
	 
	While (Select Count(*) From @unpaidInvoices) > 0
	begin	
			DECLARE  @interestReferenceNumber varchar(50)
			DECLARE @NextRefID INT 
			declare @id int = (select top 1 invoiceId from  @unpaidInvoices )
			declare @invoiceDt datetime =(select invoiceDate from @unpaidInvoices  where invoiceId = @id)
			declare @monthInterestIsRaisedFor datetime = (select DATEADD(m,1, @invoiceDt) ) 
			declare @effectiveDate datetime = (select EOMONTH(@invoiceDt))	
			declare @invoiceYear int = (select year(@invoiceDt))	
			declare @endOfMonthInterestIsRaisedFor int = (select(day((select EOMONTH(@monthInterestIsRaisedFor)))))		
			declare @numberOfInterestDays int =@endOfMonthInterestIsRaisedFor
			declare @numberOfDaysPerYear int;
			declare @paddedNextRef varchar(max)
			--number of days in the year invoice was raised
			set @numberOfDaysPerYear = ( SELECT DATEDIFF(day,  cast(@invoiceYear as char(4)),  cast(@invoiceYear+1 as char(4))) Days)
			
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
			
			declare @applicableInterestRates int = (select count(id) from @thisInvoicePrimeRates)
			
			declare @invoiceNumber nvarchar(200)
						declare @linkedTransactionId int
						declare @balance decimal(18,2)
						declare @roleplayerId int

			if @applicableInterestRates = 1
			begin---single interest rate applied
			declare @interest decimal(18,2)
						
						declare @applicablerate  decimal(18,2) = (select top 1 interestRate from @thisInvoicePrimeRates)
							
						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId,@balance = balance  from @unpaidInvoices where invoiceId = @id
												
						set  @interest =  (@balance * (@applicablerate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast((@numberOfDaysPerYear) as decimal(18,2)))
						
						----Reference number--------					
						set	@NextRefID  = (SELECT NextNumber FROM Common.DocumentNumbers d (NOLOCK) WHERE   d.Name = 'Interest')
						set @paddedNextRef  =  ( select REPLICATE('0', 6 - LEN(@NextRefID))+  cast( @NextRefID as varchar(max)))
						SELECT @interestReferenceNumber = concat( 'IN:',@paddedNextRef)
						----------------------------
						--more testing required on very old invoices that have number of days greater than 366
						--if @numberOfInterestDays > 0 and @numberOfInterestDays <31	
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
					  ,[ModifiedBy],LinkedTransactionId, RmaReference,reason, PeriodId,IsBackDated,TransactionEffectiveDate,invoiceid)
					  values (@roleplayerId,1,@interest,@currentPeriodPostingDate,7,Getdate(),Getdate(),'BackendProcess',	'BackendProcess',@linkedTransactionId, @interestReferenceNumber, concat('Interest at ', @applicablerate, '% over ',@numberOfInterestDays, ' days for :', @invoiceNumber ),@currentPeriodPostingId,0,@effectiveDate,@id)
						 	--end
							UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
						SET     NextNumber = NextNumber + 1
						WHERE   Name = 'Interest'; 
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
												
						
						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId,@balance = balance  from @unpaidInvoices where invoiceId = @id
												
						set  @interest =  (@balance * (@primeRate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast( (@numberOfDaysPerYear) as decimal(18,2)))
																	
						delete from @thisInvoicePrimeRates where id = @currentInvoicePrimeRateId
						set	@totaldayslooped=@totaldayslooped + @numberOfInterestDays
						set @currentInvoicePrimeRateId  = (select top 1 id from @thisInvoicePrimeRates)
						
						----Reference number--------					
						set	@NextRefID  = (SELECT NextNumber FROM Common.DocumentNumbers d (NOLOCK) WHERE   d.Name = 'Interest')
						set @paddedNextRef  =  ( select REPLICATE('0', 6 - LEN(@NextRefID))+  cast( @NextRefID as varchar(max)))
						SELECT @interestReferenceNumber = concat( 'IN:',@paddedNextRef)
						----------------------------
						--if @numberOfInterestDays > 0 and @numberOfInterestDays <31
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
					  ,[ModifiedBy],LinkedTransactionId, RmaReference,reason, PeriodId,IsBackDated,TransactionEffectiveDate,invoiceid)
					  values (@roleplayerId,1,@interest,@currentPeriodPostingDate,7,Getdate(),Getdate(),'BackendProcess',	'BackendProcess',@linkedTransactionId, @interestReferenceNumber, concat('Interest at ', @primeRate, '% over ',@numberOfInterestDays, ' days for :', @invoiceNumber ),@currentPeriodPostingId,0,@effectiveDate,@id)
						 	--end	
							UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
						SET     NextNumber = NextNumber + 1
						WHERE   Name = 'Interest'; 
					end	---end multiple interest rates applied	
			end						
			
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