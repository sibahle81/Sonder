CREATE FUNCTION dbo.ConvertToDate(@date varchar(24)) returns datetime
as begin
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
go
