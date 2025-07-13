
CREATE   PROCEDURE [claim].[GetEventDetailsForFollowUps] (@personEventId INT, @requiredDocuments Varchar(max) = NULL)
AS
	BEGIN
	  SELECT DISTINCT P.PersonEventId,
	  C.Name AS CompanyName,
      C.ReferenceNumber,
	  I.DisplayName AS EmployeeName,
	  E.EventDate AS DateOfAccident,
      CASE WHEN CompCarePersonEventId IS NULL THEN CL.[ClaimReferenceNumber] ELSE P.CompCarePevRefNumber
	  END AS [ClaimReferenceNumber],
	  P.CreatedDate AS ClaimDate
	  FROM claim.PersonEvent P INNER JOIN client.Company C
	  ON P.ClaimantId = C.RolePlayerId
	  INNER JOIN client.RolePlayer I ON P.InsuredLifeId = I.RolePlayerId
	  INNER JOIN [claim].[Event] E ON P.EventId = E.EventId
	  INNER JOIN [claim].[Claim] CL ON CL.PersonEventId = P.PersonEventId

	  WHERE P.PersonEventId = @personEventId


	END