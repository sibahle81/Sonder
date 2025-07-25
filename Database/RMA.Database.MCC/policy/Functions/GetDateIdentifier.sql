CREATE   FUNCTION [policy].[GetDateIdentifier] (@firstName varchar(64), @surname varchar(64), @dob varchar(32))
RETURNS NVARCHAR(256)
AS
BEGIN
    DECLARE @name varchar(128) = concat(@firstName, ' ', @surname)
	DECLARE @result varchar(256)
	DECLARE @date varchar(32)

    SET @name = RTRIM(LTRIM(@name));
    SET @result = LEFT(@name, 1);

    WHILE CHARINDEX(' ', @name,1)>0 BEGIN
        SET @name = LTRIM(RIGHT(@name, LEN(@name) - CHARINDEX(' ', @name,1)));
        SET @result += LEFT(@name, 1);
    END

	SET @date = replace(@dob, '-', '')
	SET @date = replace(@date, '/', '')

	SET @result += concat('-', @date)

    RETURN @result;
END
