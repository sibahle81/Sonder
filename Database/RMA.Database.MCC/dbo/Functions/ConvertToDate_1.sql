
CREATE FUNCTION [dbo].[ConvertToDate](@date varchar(24)) returns datetime
as begin
	-- Clean up the date string first
	if len(@date) = 10 and substring(@date, 3, 1) in ('-', '/') and substring(@date, 6, 1) in ('-', '/') begin
		declare @year varchar(4) = right(@date, 4)
		declare @month varchar(2) = substring(@date, 4, 2)
		declare @day varchar(2) = left(@date, 2)
		set @date = concat(@year, '-', @month, '-', @day)
	end
	-- Convert to datetime
	declare @result datetime
	if isdate(@date) = 1 begin
		set @result = cast(@date as datetime)
	end else begin
		if isnumeric(@date) = 1 begin
			set @result = cast((cast(@date as int) - 1) as datetime)
		end
	end
	return cast(@result as date)
end