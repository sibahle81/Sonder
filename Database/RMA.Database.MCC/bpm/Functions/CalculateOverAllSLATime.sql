CREATE FUNCTION [bpm].[CalculateOverAllSLATime]
(
	@Date1 as Datetime,
    @Date2 as Datetime
)
RETURNS NVARCHAR(100)
AS
BEGIN
	--If(@Date2 IS NULL)
	--	SET @Date2 = GETDATE()
	
	--DECLARE @ReturnValue AS NVARCHAR(100)

	DECLARE @Minutes varchar(10) 
 --   , @sMinutes varchar(2) 
  
    SET @Minutes = ABS(DATEDIFF(minute, @Date1, @Date2))

	--SET @sMinutes = RIGHT('0' + convert(varchar, @Minutes), 2)
	
	--Select @ReturnValue =  @sMinutes + ' mins'

	RETURN @Minutes + ' Min'
END

