CREATE FUNCTION [bpm].[GetNumberOfHolidaysAndWeekends]
(
  @StartDate as Date,
  @EndDate as Date,
  @GetAll INT = 0--0 Holidays + weekends, 1 = holidays, 2 = weekends
)
RETURNS INT
AS
BEGIN
	DECLARE @Year CHAR(4),@EndYear CHAR(4)
	,@Date DATETIME
	,@EasterSunday DATETIME
	,@NumberOfHolidays INT=0
	,@NumberOfWeekends INT=0
	,@WeekendHolidays INT=0
	,@ReturnValue INT

	SET @Year = YEAR(@StartDate);
	SET @EndYear = YEAR(@EndDate);

	DECLARE @Holidays TABLE([Holiday] nvarchar(30),[WeekDay] nvarchar(20), [Date] Date)
	DECLARE @Calendar TABLE([Date] Date, IsWeekend Bit)	
-- ADD all holidays per year
IF(@GetAll = 0 OR @GetAll = 1)
BEGIN
	WHILE (@Year <= @EndYear)
		BEGIN   
				SET @EasterSunday = DATEADD(dd, ROUND(DATEDIFF(dd, '1899-12-30', DATEFROMPARTS(@Year, 4, 1)) / 7.0 + ((19.0 * (@Year % 19) - 7) % 30) * 0.14, 0) * 7.0 - 6, -2)				
				
				----1 January: New Year’s Day			
				SET @Date = CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-01-01' ) 
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					IF DATEPART(WEEKDAY, @Date) = 7 -- 'Saturday'
						SET @Date = @Date + 2
					ELSE IF DATEPART(WEEKDAY, @Date) = 1 --Sunday
						SET @Date = @Date + 1
					INSERT INTO @Holidays VALUES('New Years Day', DATENAME( dw, @Date ),@Date)					
				END

				----21 March: Human Rights Day
				SET @Date =CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-03-21' ) 
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					IF DATEPART(WEEKDAY, @Date) = 7 -- 'Saturday'
						SET @Date = @Date + 2
					ELSE IF DATEPART(WEEKDAY, @Date) = 1 --Sunday
						SET @Date = @Date + 1
					INSERT INTO @Holidays VALUES('Human Rights Day', DATENAME( dw, @Date ),@Date)
				END

				--April: Good Friday
				SET @Date = @EasterSunday - 2-- Friday before Easter Sunday
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					INSERT INTO @Holidays VALUES('Good Friday', DATENAME( dw, @Date ),@Date)
				END

				--April: Family Day 
				SET @Date = @EasterSunday + 1-- Monday after Easter Sunday
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					INSERT INTO @Holidays VALUES('Family Day', DATENAME( dw, @Date ),@Date)
				END

				--27 April: Freedom Day
				SET @Date =CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-04-27' ) 
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					IF DATEPART(WEEKDAY, @Date) = 7 -- 'Saturday'
						SET @Date = @Date + 2
					ELSE IF DATEPART(WEEKDAY, @Date) = 1 --Sunday
						SET @Date = @Date + 1
					INSERT INTO @Holidays VALUES('Freedom Day', DATENAME( dw, @Date ),@Date)
				END

				--1 May: Workers Day
				SET @Date =CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-05-01' )
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					IF DATEPART(WEEKDAY, @Date) = 7 -- 'Saturday'
						SET @Date = @Date + 2
					ELSE IF DATEPART(WEEKDAY, @Date) = 1 --Sunday
						SET @Date = @Date + 1
					INSERT INTO @Holidays VALUES('Workers Day', DATENAME( dw, @Date ),@Date)
				END

				--16 June: Youth Day
				SET @Date =CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-06-16' )				
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					IF DATEPART(WEEKDAY, @Date) = 7 -- 'Saturday'
						SET @Date = @Date + 2
					ELSE IF DATEPART(WEEKDAY, @Date) = 1 --Sunday
						SET @Date = @Date + 1
					INSERT INTO @Holidays VALUES('Youth Day', DATENAME( dw, @Date ),@Date)
				END

				--9 August: National Womens Day
				SET @Date =CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-08-09' )
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					IF DATEPART(WEEKDAY, @Date) = 7 -- 'Saturday'
						SET @Date = @Date + 2
					ELSE IF DATEPART(WEEKDAY, @Date) = 1 --Sunday
						SET @Date = @Date + 1
					INSERT INTO @Holidays VALUES('National Womens Day', DATENAME( dw, @Date ),@Date)
				END

				--16 December: Day of Reconciliation
				SET @Date =CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-12-16' )
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					IF DATEPART(WEEKDAY, @Date) = 7 -- 'Saturday'
						SET @Date = @Date + 2
					ELSE IF DATEPART(WEEKDAY, @Date) = 1 --Sunday
						SET @Date = @Date + 1
					INSERT INTO @Holidays VALUES('Day of Reconciliation', DATENAME( dw, @Date ),@Date)
				END

				--25 December: Christmas Day
				SET @Date =CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-12-25' )
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN
					INSERT INTO @Holidays VALUES('Christmas Day', DATENAME( dw, @Date ),@Date)
				END

				--26 December: Day of Goodwill
				SET @Date =CONVERT( datetime, CONVERT(varchar, YEAR( @Year ) )+'-12-26' )
				IF(@Date BETWEEN @StartDate AND @EndDate)
				BEGIN 
					IF DATEPART(WEEKDAY, @Date) = 7 -- 'Saturday'
						SET @Date = @Date + 2
					ELSE IF DATEPART(WEEKDAY, @Date) = 1 --Sunday
						SET @Date = @Date + 1
					INSERT INTO @Holidays VALUES('Day of Goodwill', DATENAME( dw, @Date ),@Date)
				END			

				SET @Year = @Year + 1				
	END 
	SELECT @NumberOfHolidays = COUNT(1) FROM @Holidays where [Date] between @StartDate and @EndDate
END 

IF(@GetAll = 0 or @GetAll = 2)
BEGIN
		--SET Number of weekends
		SET @Date = @StartDate
		WHILE @Date <= @EndDate 
				BEGIN
					INSERT INTO @Calendar 
					SELECT @Date As [Date],(CASE WHEN DATEPART(Weekday, @Date) In (7, 1) 
											   THEN 1 ELSE 0 END) AS IsWeekend    											   
				  SET @Date = DateAdd(Day, 1, @Date)
				END

		SELECT @NumberOfWeekends = COUNT(1) From @Calendar Where IsWeekend = 1
END

IF(@GetAll = 0)
BEGIN
--Remove one weekend holidays
	SELECT @WeekendHolidays = count(1) FROM @Holidays WHERE [Date] IN (SELECT [Date] FROM @Calendar Where IsWeekend = 1)
END

	SET @ReturnValue = (@NumberOfHolidays + @NumberOfWeekends) - @WeekendHolidays

	RETURN @ReturnValue 

END
