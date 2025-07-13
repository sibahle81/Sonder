CREATE FUNCTION client.GetInitials(@firstName VARCHAR(50)) RETURNS VARCHAR(8)
AS BEGIN

	while charindex('  ', @firstName) > 0 begin
		set @firstName = replace(trim(@firstName), '  ', ' ')
	end

	-- Add the first letter of the input name to the initials
	declare @initials varchar(8) = left(@firstName, 1);

    -- Find spaces in the name and add the next letter as an initial
    declare @position int = charindex(' ', @firstName, 1);

    while @position > 0 begin
        set @Initials = @initials + substring(@firstName, @position + 1, 1);
        set @position = charindex(' ', @firstName, @position + 1);
    end

    return upper(@initials);
END
GO
