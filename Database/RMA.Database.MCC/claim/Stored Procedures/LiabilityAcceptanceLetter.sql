
Create   PROCEDURE [claim].[LiabilityAcceptanceLetter] (@personEventId INT)
AS
	BEGIN
		SELECT DISTINCT P.PersonEventId,
		C.Name AS CompanyName,
		C.ReferenceNumber,
		I.DisplayName AS EmployeeName,
		E.EventDate AS DateOfAccident,
		CASE WHEN CompCarePersonEventId IS NULL THEN CL.[ClaimReferenceNumber] ELSE P.CompCarePevRefNumber
		END AS [ClaimReferenceNumber],
		P.CreatedDate AS ClaimDate,
		RPA.AddressLine1,
		RPA.AddressLine2,
		RPA.PostalCode,
		RPA.City,
		RPA.Province,
		RPC.EmailAddress
		FROM claim.PersonEvent P INNER JOIN client.Company C
		ON P.ClaimantId = C.RolePlayerId
		INNER JOIN client.RolePlayer I ON P.InsuredLifeId = I.RolePlayerId
		INNER JOIN [claim].[Event] E ON P.EventId = E.EventId
		INNER JOIN [claim].[Claim] CL ON CL.PersonEventId = P.PersonEventId
		INNER JOIN [client].Person as PER  (Nolock) on PER.RolePlayerId = P.InsuredLifeId
		INNER JOIN [client].[Company] as COM  (Nolock) on COM.RolePlayerId = P.ClaimantId
		INNER JOIN [client].[RolePlayer] as R (Nolock) on R.RolePlayerId = P.InsuredLifeId
		INNER JOIN client.RolePlayerContact RPC (NoLock) on RPC.RolePlayerId = P.ClaimantId
		LEFT JOIN [client].[RolePlayerAddress]  as RPA (Nolock) ON RPA.RoleplayerId = P.ClaimantId
		LEFT JOIN [Common].[Country] CO (NoLock) ON CO.Id = RPA.CountryId
		WHERE P.PersonEventId = @personEventId


	END