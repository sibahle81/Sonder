CREATE FUNCTION [bpm].[CalculateOverAllSLADays]
(
	@Date1 as Datetime,
    @Date2 as Datetime,
	@SLAWarning int,
	@SLAEscation Int
)
RETURNS Int
AS
BEGIN
	If(@Date2 IS NULL)
		SET @Date2 = GETDATE()
	
	DECLARE @ReturnValue AS Int
	Set @ReturnValue = 0

	Declare @HoursElapsed Int
	Set @HoursElapsed = DATEDIFF(DAY, @Date1, @Date2)

	If(@HoursElapsed < @SLAWarning)
		Set @ReturnValue = 1			

	If(@HoursElapsed > @SLAWarning)
		Begin
			If(@HoursElapsed < @SLAEscation)
				Set @ReturnValue = 2
			Else
				Set @ReturnValue = 3
		End

	RETURN @ReturnValue

END
