
-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2025-06-06
-- Description:	Raises interest on overdue invoices
-- =============================================
CREATE PROCEDURE [billing].[RaiseInterestForUnpaidInvoices] 
    @periodId AS int = NULL,
	@industryClassId AS int = NULL,
	@productCategoryId AS int = NULL
AS
BEGIN
	 BEGIN TRY	
	declare @owingRoleplayers table (roleplayerId int)
	declare @tempunpaidInvoices table (invoiceNumber nvarchar(200), transactionId int, balance decimal(18,2),invoiceId int, roleplayerId int, invoiceDate datetime)
	declare @unpaidInvoices table (invoiceNumber nvarchar(200), transactionId int, balance decimal(18,2),invoiceId int, roleplayerId int, invoiceDate datetime)
	declare @endOfCurrentMonth int = (select(day((select EOMONTH(getdate())))))	
	declare @currentPeriodPostingDate date =(select enddate from common.[period] where status ='current')
	declare @currentPeriodPostingId int =(select id from common.[period] where status ='current')
	declare   @numberOfDays int = 30
	
	declare @interestMonthDate datetime = (select EOMONTH( (select dateadd(m,-1, GETDATE()))))
	
	if @periodId is not null
	begin
	set  @interestMonthDate = (select enddate from common.[period] where id = @periodId)
	end

	insert into @owingRoleplayers
	 select distinct top 1000  cf.RolePlayerId
	 from billing.invoice i  (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join client.Roleplayer rp  (nolock) on cf.RolePlayerId = rp.RolePlayerId
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
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -30, GETDATE())
	and t2.TransactionTypeId = 7  and t1.InvoiceId is not null) --dont double charge interest in the same month
	and ta.TermArrangementId is null
	and rp.IsDeleted <> 1
	and ic.id = @industryClassId
	and not exists   (select top 1 roleplayerid from billing.InterestIndicator where isactive = 1 and isdeleted=0 and roleplayerid = t.roleplayerid)
	
	-----roleplayer loop start
	declare @currentLoopedRoleplayerId int = (select top 1 roleplayerid from @owingRoleplayers)
	while (select count(roleplayerid) from @owingRoleplayers) > 0
	begin

	insert into @tempunpaidInvoices
	select  i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalance(t.TransactionId),i.invoiceid, cf.RolePlayerId, i.InvoiceDate 
	 from billing.invoice i  (nolock)
	join billing.transactions t  (nolock) on 
	t.invoiceid = i.invoiceid
	join policy.Policy p  (nolock) on p.PolicyId = i.PolicyId
	join client.FinPayee cf  (nolock) on cf.RolePlayerId = p.PolicyPayeeId
	join client.Roleplayer rp  (nolock) on cf.RolePlayerId = rp.RolePlayerId
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
	and i.InvoiceId not in (select distinct t1.InvoiceId  
	from billing.transactions t1 
	join billing.transactions t2 
	on t1.transactionid = t2.LinkedTransactionId   
	where t2.createddate  > DATEADD(day, -30, GETDATE())
	and t2.TransactionTypeId = 7  and t1.InvoiceId is not null) --dont double charge interest in the same month
	and ta.TermArrangementId is null
	and rp.IsDeleted <> 1
	and ic.id = @industryClassId
	and not exists   (select top 1 roleplayerid from billing.InterestIndicator where isactive = 1 and isdeleted=0 and roleplayerid = t.roleplayerid)
	and t.roleplayerid =@currentLoopedRoleplayerId
	
	delete @tempunpaidInvoices where balance =0

	insert into @unpaidInvoices
	select distinct * from  @tempunpaidInvoices

	declare @user varchar(50) ='BackendProcess'
		declare @today varchar(50) =Getdate()
	 
	declare @currentMonthEndForPosting date=  (select EOMONTH(Getdate()))
	
	declare @primeRates table (id int identity(1,1),interestRate decimal(18,2), startDate datetime, endDate datetime)
		
	 insert into  @primeRates
	 select [value],startDate,endDate from common.primerate where IsActive =1
	 order by startdate 		
	 
While (Select Count(*) From @unpaidInvoices) > 0
	begin			
			declare @invoiceId int = (select top 1 invoiceid from  @unpaidInvoices )

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

			declare @thisInvoicePrimeRatesWithPotentialDuplicates table (id int, interestRate decimal(18,2), startDate datetime, endDate datetime)
			declare @thisInvoicePrimeRates table (id int, interestRate decimal(18,2), startDate datetime, endDate datetime)
			
			declare @monthInterestIsRaisedForEnding datetime= (select EOMONTH(@monthInterestIsRaisedFor))
			
			declare @minPrimeStartDate datetime = (select top 1 min(startDate) from @primeRates where (@monthInterestIsRaisedFor  between startDate  and endDate))
			declare @maxPrimeEndDate datetime = (select top 1 max(endDate) from @primeRates where @monthInterestIsRaisedForEnding  between startDate  and endDate)			
		
			insert into @thisInvoicePrimeRatesWithPotentialDuplicates
			select  id,interestRate,startDate,endDate from @primeRates where startDate >= @minPrimeStartDate
			and endDate  <=@maxPrimeEndDate order by id 			
			
			--remove duplicates
				insert into @thisInvoicePrimeRates
				select distinct * from  @thisInvoicePrimeRatesWithPotentialDuplicates d
				where 	not exists(select 1  from @thisInvoicePrimeRates where id=d.id) 
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
							
						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId  from @unpaidInvoices  where invoiceid = @invoiceid
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
						
						declare @IsBackDated1 bit = 0
						if @interestMonthDate <> @currentMonthEndForPosting 
						begin
						set @IsBackDated1 = 1
						end

						INSERT INTO [billing].[Interest]([IndustryClassId],[PeriodId]
						,[RolePlayerId],[ProductCategoryId],[Balance],[CalculatedInterestAmount]
						,[InterestStatusId],[IsDeleted],[ModifiedBy],[ModifiedDate]
						,[CreatedBy],[CreatedDate],[FormulaApplied],IsBackDated,TransactionEffectiveDate
						,LinkedTransactionId, InvoiceId)
						VALUES
						(@industryClassId ,@periodId ,@roleplayerId           
						,@productCategoryId,@balance,@interest,1,0,@user,@today,@user,@today
						,concat('Interest at ', @applicablerate, '% over ',@numberOfInterestDays, ' days for :', @invoiceNumber ),@IsBackDated1,@interestMonthDate,@linkedTransactionId,@invoiceId)
							
						UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
						SET     NextNumber = NextNumber + 1
						WHERE   Name = 'Interest'; 
				
				--end
			end---end single interest rate applied

			else if  @applicableInterestRates > 1
			begin---multiple interest rates applied
						declare @lastItemId int = (select max(id) from @thisInvoicePrimeRates)

						declare @interest2 decimal(18,2)
						declare	@applicablerate2 decimal(18,2)
						set @applicablerate2   = (select top 1 interestRate from @thisInvoicePrimeRates where id = @lastItemId)
						set @numberOfInterestDays =@endOfMonthInterestIsRaisedFor

						select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId  from @unpaidInvoices  where invoiceid = @invoiceid
						set @balance =(select [dbo].[GetInvoiceBalanceBasedOnDateRange] (@linkedTransactionId, @startOfTheMonth, @interestMonthDate) )
							
						set  @interest2 =  (@balance * (@applicablerate2/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast((@numberOfDaysPerYear) as decimal(18,2)))
						
						----Reference number--------					
						set	@NextRefID  = (SELECT NextNumber FROM Common.DocumentNumbers d (NOLOCK) WHERE   d.Name = 'Interest')
						 set @paddedNextRef  =  ( select REPLICATE('0', 6 - LEN(@NextRefID))+  cast( @NextRefID as varchar(max)))
						SELECT @interestReferenceNumber = concat( 'IN:',@paddedNextRef)
						----------------------------
						--more testing required on very old invoices that have number of days greater than 366
						--if @numberOfInterestDays > 0 and @numberOfInterestDays <=31	
						--begin			
						
						declare @IsBackDated bit = 0
						if @interestMonthDate <> @currentMonthEndForPosting 
						begin
						set @IsBackDated = 1
						end

						INSERT INTO [billing].[Interest]([IndustryClassId],[PeriodId]
						,[RolePlayerId],[ProductCategoryId],[Balance],[CalculatedInterestAmount]
						,[InterestStatusId],[IsDeleted],[ModifiedBy],[ModifiedDate]
						,[CreatedBy],[CreatedDate],[FormulaApplied],IsBackDated,TransactionEffectiveDate
						,LinkedTransactionId, InvoiceId)
						VALUES
						(@industryClassId ,@periodId ,@roleplayerId           
						,@productCategoryId,@balance,@interest,1,0,@user,@today,@user,@today
						,concat('Interest at ', @applicablerate, '% over ',@numberOfInterestDays, ' days for :', @invoiceNumber ),@IsBackDated,@interestMonthDate ,@linkedTransactionId,@invoiceId)
												
						UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
						SET     NextNumber = NextNumber + 1
						WHERE   Name = 'Interest'; 
			
			end	--end multi rates
		
			delete   @unpaidInvoices where invoiceid = @invoiceId	
		end --end outer
		delete from @owingRoleplayers where roleplayerid =@currentLoopedRoleplayerId
	set	@currentLoopedRoleplayerId  = (select top 1 roleplayerid from @owingRoleplayers)
	  end -----roleplayer loop end
  END TRY  
  BEGIN CATCH                           
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
 END CATCH  
END