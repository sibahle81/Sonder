-- =============================================
-- Author:           <Author,,Name>
-- Create date: <Create Date, ,>
-- Description:      <Description, ,>
-- =============================================
CREATE   FUNCTION  [policy].[CalculateYougestChildAge] 
(
       @policyId int, 
       @dateOfBirth int
)
RETURNS int
AS
BEGIN
	declare @childAge int
	declare @currentYoungest int
	set @currentYoungest = 21

	set @childAge = DATEDIFF(year,
       @dateOfBirth, getdate())
	  
	if ( @childAge <= @currentYoungest)
			set @currentYoungest = @childAge 
    RETURN @currentYoungest

END