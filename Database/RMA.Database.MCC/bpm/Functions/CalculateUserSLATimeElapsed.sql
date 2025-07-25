CREATE FUNCTION [bpm].[CalculateUserSLATimeElapsed]
(
	@Date1 as Datetime,
    @Date2 as Datetime
)
RETURNS NVARCHAR(100)
AS
BEGIN
	If(@Date2 IS NULL)
		SET @Date2 = GETDATE()
	
	DECLARE @ReturnValue AS NVARCHAR(100)

	Declare @Seconds int
	SET @Seconds = DATEDIFF(second, @Date1, @Date2)

	DECLARE @Days int 
    , @Hours int 
    , @Minutes int 
    , @sDays varchar(5) 
    , @sHours varchar(2) 
    , @sMinutes varchar(2) 
    , @sSeconds varchar(2) 

	SET @Hours = @Seconds/3600
	SET @Minutes = (@Seconds % 3600) /60
	SET @Seconds = (@Seconds % 3600) % 60

	IF @Hours > 23 
	BEGIN
		SET @Days = @Hours/24
		SET @Hours = (@Hours % 24)
	END
	ELSE
	BEGIN
		SET @Days = 0
	END

	SET @sDays = RIGHT('0' + convert(varchar, @Days), 2)
	SET @sHours = RIGHT('0' + convert(varchar, @Hours), 2)
	SET @sMinutes = RIGHT('0' + convert(varchar, @Minutes), 2)
	SET @sSeconds = RIGHT('0' + convert(varchar, @Seconds), 2)

	Select @ReturnValue =  @sDays + ' days ' + @sHours + ' hrs ' + @sMinutes + ' mins'

	RETURN @ReturnValue

END
