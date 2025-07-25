CREATE  FUNCTION [bpm].[CalculateOverAllSLATimeElapsed]
(
	@Date1 as Datetime,
    @Date2 as Datetime
)
RETURNS NVARCHAR(100)
AS
BEGIN
	If(@Date2 IS NULL)
		SET @Date2 = GETDATE()
	
	DECLARE @ReturnValue AS NVARCHAR(100),@SLADays AS NVARCHAR(100)
	DECLARE @Days int, @Hours int, @Minutes int, @Seconds int, @rSeconds int,@HolidaysAndWeekends int


	SET @Seconds = DATEDIFF(second, @Date1, @Date2);
	SET @HolidaysAndWeekends = ([bpm].[GetNumberOfHolidaysAndWeekends](@Date1,@Date2,0) * 86400);
	IF @Seconds >= @HolidaysAndWeekends
	BEGIN
		 SET @Seconds  = @Seconds - @HolidaysAndWeekends
	END

	--Set Days
	SET @Days = @Seconds / 86400
	SET @rSeconds = @Seconds % 86400 
	--Set Hours
	SET @Hours = @rSeconds / 3600
	SET @rSeconds = @rSeconds % 3600 
	--Set Hours
	SET @Minutes = @rSeconds / 60 
	SET @rSeconds = @rSeconds % 60 

	IF(@Days < 99)
	BEGIN
		SET @SLADays = RIGHT('0' + convert(varchar, @Days), 2)
	END
	ELSE
	BEGIN
	SET @SLADays = RIGHT('0' + convert(varchar, @Days), 3)
	END
	
	Select @ReturnValue =  CONCAT(@SLADays, ' days ' , RIGHT('0' + convert(varchar, @Hours), 2) , ' hrs ' , RIGHT('0' + convert(varchar, @Minutes), 2) , ' mins')

	RETURN @ReturnValue

END