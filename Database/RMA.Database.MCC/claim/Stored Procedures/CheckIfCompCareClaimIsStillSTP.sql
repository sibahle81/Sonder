CREATE PROCEDURE [claim].[CheckIfCompCareClaimIsStillSTP]
	@CompCarePersonEventId INT
AS
BEGIN
  
  SELECT CAST(ISNULL(IsStraightThroughProcess,1) AS BIT) AS 'isSTP' FROM compcare.personEvent WHERE PersonEventId = @CompCarePersonEventId


END