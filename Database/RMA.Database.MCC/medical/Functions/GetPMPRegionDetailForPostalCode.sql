CREATE FUNCTION [common].[GetPMPRegionDetailForPostalCode]
(
	@PostalCode VARCHAR(15)
)
RETURNS VARCHAR(255)
AS
BEGIN
	--select [common].[GetPMPRegionDetailForPostalCode]('2091')

       DECLARE @PMPRegionID INT, @RegionName VARCHAR(255) = ''

       SELECT @PMPRegionID = PMPRegionId FROM common.PostalCodeRange WHERE @PostalCode between FromPostalCode AND ToPostalCode

       SELECT @RegionName = [Name] FROM common.PMPRegion WHERE PMPRegionID = @PMPRegionID

       RETURN @RegionName
END

