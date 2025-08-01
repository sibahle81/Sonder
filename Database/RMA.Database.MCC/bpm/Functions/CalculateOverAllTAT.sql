CREATE FUNCTION [bpm].[CalculateOverAllTAT]
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

	Declare @minutes int
	Declare @Hours int
	Declare @seconds int


	SET @seconds = DATEDIFF(second, @Date1, @Date2)
	SET @minutes = DATEDIFF(minute, @Date1, @Date2)
	SET @Hours = DATEDIFF(hour, @Date1, @Date2)


	DECLARE @sMinutes varchar(20)
	DECLARE @sHours varchar(20)
	DECLARE @sseconds varchar(20)

	SET @sHours = RIGHT('0' + convert(varchar, @Hours), 2)
	SET @sMinutes = RIGHT('0' + convert(varchar, @minutes), 2)
	SET @sseconds = RIGHT('0' + convert(varchar, @seconds), 2)

	Select @ReturnValue = @sHours + ' hrs ' + @sMinutes + ' mins '+@sseconds + ' sec '

	


	RETURN @ReturnValue 

END
