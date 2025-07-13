CREATE FUNCTION [client].[CalculateAge] (@dob date) returns int
as begin
	declare @today date = cast(getdate() as date)
	declare @age int = year(@today) - year(@dob)
	declare @birthday date

	if (month(@dob) = 2 and day(@dob) = 29 and year(@today) % 4 != 0 and year(@today) % 400 != 0) begin
		set @birthday = cast(concat(year(@today), '-02-28') as date)
	end
	else begin
		set @birthday = cast(concat(year(@today), '-', month(@dob), '-', day(@dob)) as date)
	end

	declare @daysDiff int = datediff(day, @birthday, @today)

	if @daysDiff < 0 begin
		set @age = @age - 1
	end

	return iif(@age < 0, 0, @age)
end
