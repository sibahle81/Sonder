CREATE   FUNCTION [dbo].[GetDOBFromID] (@ID Varchar(30)) RETURNS varchar(16)
AS
BEGIN
	if len(@ID) = 13 begin
		if isnumeric(@ID) = 1 begin
			declare @dob varchar(16)
			declare @sYear varchar(4)
			declare @sMonth varchar(2)
			declare @sDay varchar(2)
			declare @iYear int

			set @sYear = substring(@id, 1, 2)
			set @sMonth = substring(@id, 3, 2)
			set @sDay = SUBSTRING(@id, 5, 2)
			set @iYear = 2000 + @sYear

			if @iYear <= year(getdate()) begin
				set @sYear = concat('20', @sYear)
			end else begin
				set @sYear = concat('19', @sYear)
			end
			set @dob = concat(@sYear, '-', @sMonth, '-', @sDay)
			return @dob
		end
	end
	return null
END