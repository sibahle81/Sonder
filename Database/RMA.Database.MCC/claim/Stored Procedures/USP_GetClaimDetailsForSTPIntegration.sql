
CREATE   PROCEDURE [claim].[USP_GetClaimDetailsForSTPIntegration]
	@ClaimReferenceNumber nvarchar(150)
AS
BEGIN

	SELECT
	CASE
	WHEN cl.LiabilityStatusID = 1  then 'Accepted'
	ELSE 'Claim Liability not accepted'
	END AS 'ClaimLiabilityStatus'
	,p.DateOfDeath AS 'DateOfDeath' ,ev.EventDateTime AS 'EventDate',
	CAST(IIF(pv.IsStraightThroughProcess = 1, 1, 0) AS BIT) AS 'IsStraightThroughProcess'
	FROM [compcare].[claim] AS cl
	INNER JOIN [compcare].[PersonEvent] AS pv ON cl.PersonEventID = pv.PersonEventID
	INNER JOIN [compcare].[Person] AS p ON pv.PersonID = p.PersonID
	INNER JOIN [compcare].[Event] AS ev ON pv.EventID = ev.EventID
	WHERE FileRefNumber = @ClaimReferenceNumber

END
GO


