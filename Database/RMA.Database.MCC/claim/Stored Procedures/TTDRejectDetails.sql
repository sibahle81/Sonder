
CREATE   PROCEDURE [claim].[TTDRejectDetails] 
	@personEventId INT,
	@ClaimInvoiceId INT
AS

--Declare @personEventId INT
--Declare @ClaimInvoiceId INT
--Set @personEventId = 24026839
--Set @ClaimInvoiceId = 19567

	BEGIN
	  SELECT DISTINCT P.PersonEventId,
	  C.Name AS CompanyName,
      C.ReferenceNumber,
	  I.DisplayName AS EmployeeName,
	  E.EventDate AS DateOfAccident,
      CASE WHEN CompCarePersonEventId IS NULL THEN CL.[ClaimReferenceNumber] ELSE P.CompCarePevRefNumber
	  END AS [ClaimReferenceNumber],
	  P.CreatedDate AS ClaimDate,
	  CI.AuthorisedAmount As AuthorisedAmount
	  FROM claim.PersonEvent P INNER JOIN client.Company C
	  ON P.ClaimantId = C.RolePlayerId
	  INNER JOIN client.RolePlayer I ON P.InsuredLifeId = I.RolePlayerId
	  INNER JOIN [claim].[Event] E ON P.EventId = E.EventId
	  INNER JOIN [claim].[Claim] CL ON CL.PersonEventId = P.PersonEventId
	  INNER JOIN [claim].[DaysOffInvoice] DI ON DI.PersonEventId = P.PersonEventId
	  INNER JOIN [Claim].[ClaimInvoice] CI ON CI.ClaimInvoiceId = DI.ClaimInvoiceId
	  WHERE P.PersonEventId = @personEventId
	  AND CI.ClaimInvoiceId = @ClaimInvoiceId


	END