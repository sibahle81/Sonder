CREATE FUNCTION [client].[GetGender]
(
	@IdNumber VARCHAR (15)
)
RETURNS NVARCHAR(10)
AS
BEGIN

	RETURN CASE WHEN @IdNumber IS NULL OR LEN(@IdNumber) <> 13 OR ISNUMERIC(@IdNumber) = 0 THEN 'Undefined' 
           ELSE --ID's up to 4999 are Female and ID's from 5000 are Male     
           CASE WHEN CAST(SUBSTRING(@IdNumber, 7, 4) AS INT) > 4999 THEN 'Male' ELSE 'Female' END     
           END;
END