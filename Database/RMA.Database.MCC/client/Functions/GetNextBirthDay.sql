CREATE FUNCTION client.GetNextBirthday (@dob date)
RETURNS DATE
AS BEGIN
	declare @today date = getdate()
	declare @birthDay date

    -- Calculate the birthday for this year, allow for people born on leap day
	if month(@dob) = 2 and day(@dob) = 29 begin
		set @birthDay = datefromparts(year(@today), month(@dob), day(@dob) - 1)
	end else begin
		set @birthDay = datefromparts(year(@today), month(@dob), day(@dob))
	end

    -- If the birthday has already occurred this year, calculate next year's birthday
	if @birthDay <= @today begin
		set @birthDay = dateadd(year, 1, @birthDay)
	end

	return @birthDay
END
