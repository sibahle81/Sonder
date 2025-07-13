
CREATE PROCEDURE [common].[GetIndustryClassDetails]
	@industryClassId INT
AS

--Declare @IndustryClassId INT
--Set @industryClassId = 1

BEGIN
	
	SELECT 
		IC.Id,
		IC.Code,
		IC.[Name]
		FROM [common].IndustryClass IC
		WHERE IC.Id = @industryClassId
END