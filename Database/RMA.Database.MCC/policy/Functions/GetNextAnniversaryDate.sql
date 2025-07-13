CREATE FUNCTION [policy].[GetNextAnniversaryDate] (@inceptionDate date)
RETURNS DATE
AS BEGIN
	declare @today date = getdate()
	declare @anniversaryDate date

    -- Calculate the anniversary date for this year
	set @anniversaryDate = datefromparts(year(@today), month(@inceptionDate), day(@inceptionDate))

    -- If the anniversary has already occurred this year, calculate next year's anniversary
	if @anniversaryDate <= @today begin
		set @anniversaryDate = dateadd(year, 1, @anniversaryDate)
	end

	return @anniversaryDate
END
GO