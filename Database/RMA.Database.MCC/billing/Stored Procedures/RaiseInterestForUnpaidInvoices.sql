
-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023-01-03
-- Description:	Raises interest on overdue invoices
-- =============================================
CREATE PROCEDURE [billing].[RaiseInterestForUnpaidInvoices] 
AS
BEGIN

	 BEGIN TRY
	declare @unpaidInvoices table (invoiceNumber nvarchar(200), transactionId int, balance decimal(18,2),invoiceId int, roleplayerId int, invoiceDate datetime)
	declare @endOfCurrentMonth int = (select(day((select EOMONTH(getdate())))))
	declare   @numberOfDays int = -(select(day((select EOMONTH(getdate())))))

	---monthly
	insert into @unpaidInvoices
	select  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	 from billing.invoice i  (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join common.Industry ind  on ind.id = cf.IndustryId
	join common.IndustryClass ic   on ind.IndustryClassId= ic.Id
	join product.ProductOption po  (nolock) on po.id = p.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1
	where t.TransactionTypeId = 6
	and i.InvoiceDate < DATEADD(day, cast( @numberOfDays as int), GETDATE())
	and p.PolicyOwnerId = p.PolicyPayeeId
	and p.PaymentFrequencyId = 2
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -30, GETDATE())
	and t2.TransactionTypeId = 7) --dont double charge interest in the same month/quarter etc
	
	---quarterly
	union all 
	select  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	from billing.invoice i  (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join common.Industry ind   on ind.id = cf.IndustryId
	join common.IndustryClass ic  on ind.IndustryClassId= ic.Id
	join product.ProductOption po  (nolock) on po.id = p.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1
	where t.TransactionTypeId = 6
	and i.InvoiceDate < DATEADD(day, cast( @numberOfDays as int), GETDATE())	
	and p.PolicyOwnerId = p.PolicyPayeeId
	and p.PaymentFrequencyId = 3
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -91, GETDATE())
	and t2.TransactionTypeId = 7) --dont double charge interest in the same month/quarter etc
	
	---biannually
	union all
	select  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	from billing.invoice i   (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join common.Industry ind  on ind.id = cf.IndustryId
	join common.IndustryClass ic   on ind.IndustryClassId= ic.Id
	join product.ProductOption po  (nolock) on po.id = p.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1
	where t.TransactionTypeId = 6
	and i.InvoiceDate < DATEADD(day, cast( @numberOfDays as int), GETDATE())	
	and p.PolicyOwnerId = p.PolicyPayeeId
	and p.PaymentFrequencyId = 4 
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -183, GETDATE())
	and t2.TransactionTypeId = 7) --dont double charge interest in the same month/quarter etc
	
	---annually
	union all
	select  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	from billing.invoice i  (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join common.Industry ind   on ind.id = cf.IndustryId
	join common.IndustryClass ic   on ind.IndustryClassId= ic.Id
	join product.ProductOption po  (nolock) on po.id = p.ProductOptionId
	join [product].[ProductOptionBillingIntegration] pobi  (nolock) on pobi.ProductOptionId = po.Id and pobi.AccumulatesInterest = 1
	where t.TransactionTypeId = 6
	and i.InvoiceDate < DATEADD(day, cast( @numberOfDays as int), GETDATE())	
	and p.PolicyOwnerId = p.PolicyPayeeId
	and p.PaymentFrequencyId = 1 
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -365, GETDATE())
	and t2.TransactionTypeId = 7) --dont double charge interest in the same month/quarter etc

	delete @unpaidInvoices where balance =0
	
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
		
			declare @id int = (select top 1 invoiceId from  @unpaidInvoices )
			declare @invoiceDt datetime =(select invoiceDate from @unpaidInvoices  where invoiceId = @id)
			declare @monthInterestIsRaisedFor datetime = (select DATEADD(m,1, @invoiceDt) ) 
			declare @postingDate datetime = (select EOMONTH(@invoiceDt))	
			declare @endOfMonthInterestIsRaisedFor int = (select(day((select EOMONTH(@monthInterestIsRaisedFor)))))		
			declare @numberOfInterestDays int =@endOfMonthInterestIsRaisedFor
			
			declare @thisInvoicePrimeRates table (id int, interestRate int, startDate datetime, endDate datetime)
			declare @minPrimeStartDate datetime = (select top 1 min(startDate) from @primeRates)
			declare @maxPrimeEndDate datetime = (select top 1 max(endDate) from @primeRates)
			declare @monthInterestIsRaisedForEnding datetime= (select EOMONTH(@monthInterestIsRaisedFor))
			
			insert into @thisInvoicePrimeRates
			select id,interestRate,startDate,endDate from @primeRates where endDate >= @monthInterestIsRaisedForEnding
			
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
												
						set  @interest =  (@balance * (@applicablerate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast( (365/ cast( 6   as decimal(18,2))) as decimal(18,2)))
												
						insert into billing.[Transactions] (
					  [RolePlayerId]
					  ,[TransactionTypeLinkId]
					  ,[Amount]
					  ,[TransactionDate]
					  ,[TransactionTypeId]
					  ,[CreatedDate]
					  ,[ModifiedDate]
					  ,[CreatedBy]
					  ,[ModifiedBy],LinkedTransactionId, RmaReference,reason)
					  values (@roleplayerId,1,@interest,@postingDate,7,Getdate(),Getdate(),'BackendProcess',	'BackendProcess',@linkedTransactionId, concat('Overdue-Invoice: ', @invoiceNumber), concat('Interest at ', @applicablerate, '% over ',@numberOfInterestDays, ' days' ))
						 	
			end---end single interest rate applied

			else
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
														
							if 	@invoicePrimeRateStartDate <= @monthInterestIsRaisedFor and @invoicePrimeEndDate <  @monthInterestIsRaisedForEnding
							begin
								set	@numberOfInterestDays = DATEDIFF(day,@monthInterestIsRaisedFor, @invoicePrimeEndDate) +1 -- fix off by 1 day error							
							end

							if 	@invoicePrimeRateStartDate <= @monthInterestIsRaisedFor and @invoicePrimeEndDate >  @monthInterestIsRaisedForEnding
							begin
								set	@numberOfInterestDays = DATEDIFF(day,@monthInterestIsRaisedFor, @endOfMonthInterestIsRaisedFor) +1 -- fix off by 1 day error							
							end

							if 	@invoicePrimeRateStartDate > @monthInterestIsRaisedFor and @invoicePrimeEndDate >  @monthInterestIsRaisedForEnding
							begin
								set	@numberOfInterestDays = DATEDIFF(day,@invoicePrimeRateStartDate, @endOfMonthInterestIsRaisedFor) +1 -- fix off by 1 day error							
							end

							if 	@invoicePrimeRateStartDate > @monthInterestIsRaisedFor and @invoicePrimeEndDate <  @monthInterestIsRaisedForEnding
							begin
								set	@numberOfInterestDays = DATEDIFF(day,@invoicePrimeRateStartDate, @invoicePrimeEndDate) +1 -- fix off by 1 day error					
							end							

							if @currentInvoicePrimeRateId=@lastItem 
							begin
							 declare @difference int=0
								if  (@totaldayslooped + @numberOfInterestDays) < 30
								begin
								  set @difference = 30-(@totaldayslooped + @numberOfInterestDays) 
								  set	@numberOfInterestDays = @numberOfInterestDays - @difference								 
								end

								if  (@totaldayslooped + @numberOfInterestDays) > 30
								begin
									set @difference = (@totaldayslooped + @numberOfInterestDays) -30								  
									set	@numberOfInterestDays = @numberOfInterestDays - @difference
								end							
							end					
						
						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId,@balance = balance  from @unpaidInvoices where invoiceId = @id
												
						set  @interest =  (@balance * (@primeRate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast( (365/ cast( 6   as decimal(18,2))) as decimal(18,2)))
																	
						delete from @thisInvoicePrimeRates where id = @currentInvoicePrimeRateId
						set	@totaldayslooped=@totaldayslooped + @numberOfInterestDays
						set @currentInvoicePrimeRateId  = (select top 1 id from @thisInvoicePrimeRates)
						
						insert into billing.[Transactions] (
					  [RolePlayerId]
					  ,[TransactionTypeLinkId]
					  ,[Amount]
					  ,[TransactionDate]
					  ,[TransactionTypeId]
					  ,[CreatedDate]
					  ,[ModifiedDate]
					  ,[CreatedBy]
					  ,[ModifiedBy],LinkedTransactionId, RmaReference,reason)
					  values (@roleplayerId,1,@interest,@postingDate,7,Getdate(),Getdate(),'BackendProcess',	'BackendProcess',@linkedTransactionId, concat('Overdue-Invoice: ', @invoiceNumber), concat('Interest at ', @primeRate, '% over ',@numberOfInterestDays, ' days' ))
						 		
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