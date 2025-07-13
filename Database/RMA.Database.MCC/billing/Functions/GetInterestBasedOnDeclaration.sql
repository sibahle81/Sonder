-- =============================================
-- Author:		bongani makelane
-- Create date: 2022-06-13
-- =============================================
CREATE FUNCTION [billing].GetInterestBasedOnDeclaration
(
@premium decimal,
@year int,--interest was charged on
@month int--interest was charged on
)
RETURNS decimal
AS
BEGIN
	DECLARE @result decimal(18,2)

declare @monthInterestIsRaisedFor datetime = concat(@month,'-',1,'-',@year)
	declare @endOfMonthInterestIsRaisedFor datetime = (select EOMONTH(@monthInterestIsRaisedFor))
			
	declare @primeRates table (id int identity(1,1),interestRate int, startDate datetime, endDate datetime)
	
	insert into  @primeRates
	 select [value],startDate,endDate from common.primerate where (startDate between  @monthInterestIsRaisedFor and @endOfMonthInterestIsRaisedFor)
	 or (endDate  between  @monthInterestIsRaisedFor and @endOfMonthInterestIsRaisedFor)
	 order by startdate 
				
			declare @numberOfInterestDays int =(select(day((select EOMONTH(@endOfMonthInterestIsRaisedFor)))))	
			
			declare @thisDeclarationPrimeRates table (id int, interestRate int, startDate datetime, endDate datetime)
			declare @minPrimeStartDate datetime = (select top 1 min(startDate) from @primeRates)
			declare @maxPrimeEndDate datetime = (select top 1 max(endDate) from @primeRates)
			declare @monthInterestIsRaisedForEnding datetime= (select EOMONTH(@monthInterestIsRaisedFor))
			insert into @thisDeclarationPrimeRates
			select id,interestRate,startDate,endDate from @primeRates where (startDate between  @monthInterestIsRaisedFor and @monthInterestIsRaisedForEnding)
			or (endDate  between  @monthInterestIsRaisedFor and @monthInterestIsRaisedForEnding)					

			declare @summedInterest decimal(18,2)=0
			declare @lastItem int = (select max(id) from @thisDeclarationPrimeRates)
			declare @totaldayslooped int = 0
			declare @currentDeclarationPrimeRateId int = (select top 1 id from @thisDeclarationPrimeRates)
					while (select count(id) from @thisDeclarationPrimeRates) > 0
						begin
						declare @primeRate decimal(18,2) =(select top 1 interestRate from @thisDeclarationPrimeRates where 
						id = @currentDeclarationPrimeRateId)

							declare @DeclarationPrimeRateStartDate datetime =(select startDate from @thisDeclarationPrimeRates where 
							id = @currentDeclarationPrimeRateId)
							
							declare @DeclarationPrimeEndDate datetime =(select endDate from @thisDeclarationPrimeRates where 
							id = @currentDeclarationPrimeRateId)							
														
							if 	@DeclarationPrimeRateStartDate <= @monthInterestIsRaisedFor and @DeclarationPrimeEndDate <  @monthInterestIsRaisedForEnding
							begin
								set	@numberOfInterestDays = DATEDIFF(day,@monthInterestIsRaisedFor, @DeclarationPrimeEndDate) +1 -- fix off by 1 day error							
							end

							if 	@DeclarationPrimeRateStartDate <= @monthInterestIsRaisedFor and @DeclarationPrimeEndDate >  @monthInterestIsRaisedForEnding
							begin
								set	@numberOfInterestDays = DATEDIFF(day,@monthInterestIsRaisedFor, @endOfMonthInterestIsRaisedFor) +1 -- fix off by 1 day error							
							end

							if 	@DeclarationPrimeRateStartDate > @monthInterestIsRaisedFor and @DeclarationPrimeEndDate >  @monthInterestIsRaisedForEnding
							begin
								set	@numberOfInterestDays = DATEDIFF(day,@DeclarationPrimeRateStartDate, @endOfMonthInterestIsRaisedFor) +1 -- fix off by 1 day error							
							end

							if 	@DeclarationPrimeRateStartDate > @monthInterestIsRaisedFor and @DeclarationPrimeEndDate <  @monthInterestIsRaisedForEnding
							begin
								set	@numberOfInterestDays = DATEDIFF(day,@DeclarationPrimeRateStartDate, @DeclarationPrimeEndDate) +1 -- fix off by 1 day error					
							end							

							if @currentDeclarationPrimeRateId=@lastItem 
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

						declare @interest decimal(18,2)	
						declare @roleplayerId int	

						set  @interest =  (@premium * (@primeRate/ cast (100 as decimal(18,2)))) * (@numberOfInterestDays /  cast( (365/ cast( 6   as decimal(18,2))) as decimal(18,2)))
					
						set @summedInterest = @summedInterest + @interest	
												
						delete from @thisDeclarationPrimeRates where id = @currentDeclarationPrimeRateId
						set	@totaldayslooped=@totaldayslooped + @numberOfInterestDays
						set @currentDeclarationPrimeRateId  = (select top 1 id from @thisDeclarationPrimeRates)				
					end									
			
			set @result = (select @summedInterest)
	-- Return the result of the function
	RETURN @result

END