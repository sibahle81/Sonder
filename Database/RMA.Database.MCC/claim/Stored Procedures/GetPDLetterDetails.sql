
CREATE   PROCEDURE [claim].[GetPDLetterDetails] 
(@personEventId INT)
AS

--Declare @personEventId INT
--Set @personEventId = 23024603

	BEGIN
	  SELECT DISTINCT P.PersonEventId,
	  C.Name AS CompanyName,
      C.ReferenceNumber,
	  I.DisplayName AS EmployeeName,
	  E.EventDate AS DateOfAccident,
      CASE WHEN CompCarePersonEventId IS NULL THEN CL.[ClaimReferenceNumber] ELSE P.CompCarePevRefNumber
	  END AS [ClaimReferenceNumber],
	  P.CreatedDate AS ClaimDate,
	  'S62.61' AS ICD10Code,
	  'Fracture of other finger, open' As Diagnosis,
	  4500 As AccidentEarnings,
	  3 As DisabilityAwarded
	  FROM claim.PersonEvent P INNER JOIN client.Company C
	  ON P.ClaimantId = C.RolePlayerId
	  INNER JOIN client.RolePlayer I ON P.InsuredLifeId = I.RolePlayerId
	  INNER JOIN [claim].[Event] E ON P.EventId = E.EventId
	  INNER JOIN [claim].[Claim] CL ON CL.PersonEventId = P.PersonEventId

	  WHERE P.PersonEventId = @personEventId


	END