CREATE Procedure [claim].[GetSection40ClaimToReOpen]

--EXEC [claim].[GetSection40ClaimToReOpen]
AS
BEGIN

	--CREATE TABLE #AdjudicateClaims(
 --   ClaimId int  NOT NULL,
 --   ClaimReferenceNumber varchar(150) NOT NULL,
 --   PersonEventId int NOT NULL,
 --   ClaimantId int NOT NULL,
 --   InsuredLifeId int NOT NULL,
 --   ProductCode varchar(150) NOT NULL,
 --   IsVopdVerified bit NOT NULL,
	--IsAlive bit Not Null,
 --   IdType int NOT NULL,
 --   SuspiciousTransactionStatus int NOT NULL,
 --   EmployerFirstName varchar(150) NOT NULL,
 --   EmployeeSurname varchar(150) NOT NULL,
 --   CommunicationType int NOT NULL,
 --   EmployeeEmailAddress varchar(500) NULL,
 --   EmployeeCellNumber varchar(50) NULL,
 --   Title int NOT NULL,
 --   EventDate datetime NOT NULL,
 --   CompanyName varchar(255) NOT NULL,
 --   CompanyReferenceNumber varchar(150) NOT NULL,
 --   CompanyAddressLine1 varchar NULL,
 --   CompanyCity varchar(150) NULL,
 --   CompanyPostalCode varchar(150) NULL,
 --   PolicyId int NULL,
 --   [DocumentsBeenUploaded] bit NOT NULL,
	--CompCarePEVRefNumber varchar(150),
	--EmployeeIdNumber varChar(50))

	--COMPCARE INTERGRATION CLAIMS
	--Begin
	--    UPDATE claim.Claim SET ClaimStatusId = 15, ClaimLiabilityStatusId = 0, IsClosed = 0, ModifiedDate = GetDate() WHERE ClaimId IN (
	--	Select 
	--		C.ClaimId as ClaimId
	--	FROM claim.personEvent AS PE (Nolock)
	--	INNER JOIN compcare.personEvent AS CP (Nolock) ON PE.CompCarePersonEventId = CP.PersonEventId
	--	INNER JOIN [claim].[Event] AS E (Nolock) ON E.EventId = PE.EventId
	--	INNER JOIN [claim].[ClaimBucketClass] AS CBC (Nolock) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
	--	INNER JOIN [claim].[Claim] AS C (Nolock) ON C.PersonEventId = PE.PersonEventId
	--	INNER JOIN [client].Person as PER  (Nolock) on PER.RolePlayerId = PE.InsuredLifeId
	--	INNER JOIN [client].[Company] as COM  (Nolock) on COM.RolePlayerId = PE.ClaimantId
	--	INNER JOIN [client].[RolePlayer] as R (Nolock) on R.RolePlayerId = PE.InsuredLifeId	
	--	CROSS APPLY(select  top 1  [claim].[CheckCompCareDocumentsUploadedFunction] (PE.CompCarePEVRefNumber,PER.IdNumber) as IsUploaded) AS chkCC
	--	LEFT JOIN [client].[RolePlayerAddress]  as RPA (Nolock) ON RPA.RoleplayerId = PE.ClaimantId
	--	Where pe.IsStraightThroughProcess = 1 AND CBC.IsStraightThroughProcessBenefit = 1 
	--	AND PE.CompCarePersonEventId is Not null AND CP.IsStraightThroughProcess IS NULL
	--	AND CBC.ClaimBucketClassId != 15 AND PE.SuspiciousTransactionStatusId = 0 AND C.ClaimStatusId IN (6) 
	--	and chkCC.IsUploaded = 1 AND PE.CreatedDate > '2022-12-15 18:44:53.537' AND
	--	DATEDIFF(day,PE.CreatedDate, GetDate()) <= 90
	--	)
	--END

	--INTERNAL MODERNIZATION CLAIMS
	--Begin
	--    UPDATE claim.Claim SET ClaimStatusId = 15, ClaimLiabilityStatusId = 0, IsClosed = 0, ModifiedDate = GetDate() WHERE ClaimId IN (
	--	Select 
	--		C.ClaimId as ClaimId
	--	FROM claim.personEvent AS PE (Nolock)
	--	INNER JOIN [claim].[Event] AS E (Nolock) ON E.EventId = PE.EventId
	--	INNER JOIN [claim].[ClaimBucketClass] AS CBC (Nolock) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
	--	INNER JOIN [claim].[Claim] AS C (Nolock) ON C.PersonEventId = PE.PersonEventId
	--	INNER JOIN [client].Person as PER  (Nolock) on PER.RolePlayerId = PE.InsuredLifeId
	--	INNER JOIN [client].[Company] as COM  (Nolock) on COM.RolePlayerId = PE.ClaimantId
	--	INNER JOIN [client].[RolePlayer] as R (Nolock) on R.RolePlayerId = PE.InsuredLifeId	
	--	CROSS APPLY(select  top 1 [claim].[CheckInternalClaimsDocumentsUploadedFunction] (PE.PersonEventId) as IsUploaded) AS chkCC
	--	LEFT JOIN [client].[RolePlayerAddress]  as RPA (Nolock) ON RPA.RoleplayerId = PE.ClaimantId
	--	Where pe.IsStraightThroughProcess = 1 AND CBC.IsStraightThroughProcessBenefit = 1 
	--	AND PE.CompCarePersonEventId IS NULL AND chkCC.IsUploaded = 1
	--	AND CBC.ClaimBucketClassId != 15 AND PE.SuspiciousTransactionStatusId = 0 AND C.ClaimStatusId IN (6) 
	--	AND DATEDIFF(day,PE.CreatedDate, GetDate()) <= 90
	--	)
	--END
	
	--COMPCARE INTERGRATION CLAIMS
	--Begin
	--	insert into #AdjudicateClaims
	--	Select 
	--		C.ClaimId as ClaimId,
	--		C.ClaimReferenceNumber as ClaimReferenceNumber,
	--		C.PersonEventId as PersonEventId ,
	--		PE.ClaimantId as ClaimantId,
	--		PE.InsuredLifeId as InsuredLifeId,
	--		'EMP' as ProductCode,
	--		PER.IsVopdVerified as IsVopdVerified,
	--		PER.IsAlive as IsAlive,
	--		PER.IdTypeId as IdType,
	--		PE.SuspiciousTransactionStatusId as SuspiciousTransactionStatus,
	--		PER.Firstname as EmployerFirstName,
	--		PER.Surname as EmployeeSurname,
	--		ISNULL(R.PreferredCommunicationTypeId,4) as CommunicationType,
	--		R.EmailAddress as EmployeeEmailAddress,
	--		R.CellNumber as EmployeeCellNumber,
	--		ISNULL(PER.TitleId,6) As Title,
	--		E.EventDate as EventDate,
	--		COM.[Name] as CompanyName,
	--		COM.[ReferenceNumber] as CompanyReferenceNumber,
	--		RPA.AddressLine1 as CompanyAddressLine1,
	--		RPA.City as CompanyCity,
	--		RPA.PostalCode as CompanyPostalCode,
	--		0 as PolicyId,
	--		cast(1 as bit) AS [DocumentsBeenUploaded],
	--		PE.CompCarePEVRefNumber as CompCarePEVRefNumber,
	--		PER.IdNumber as EmployeeIdNumber
	--	FROM claim.personEvent AS PE (Nolock)
	--	INNER JOIN compcare.personEvent AS CP (Nolock) ON PE.CompCarePersonEventId = CP.PersonEventId
	--	INNER JOIN [claim].[Event] AS E (Nolock) ON E.EventId = PE.EventId
	--	INNER JOIN [claim].[ClaimBucketClass] AS CBC (Nolock) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
	--	INNER JOIN [claim].[Claim] AS C (Nolock) ON C.PersonEventId = PE.PersonEventId
	--	INNER JOIN [client].Person as PER  (Nolock) on PER.RolePlayerId = PE.InsuredLifeId
	--	INNER JOIN [client].[Company] as COM  (Nolock) on COM.RolePlayerId = PE.ClaimantId
	--	INNER JOIN [client].[RolePlayer] as R (Nolock) on R.RolePlayerId = PE.InsuredLifeId	
	--	CROSS APPLY(select  top 1  [claim].[CheckCompCareDocumentsUploadedFunction] (PE.CompCarePEVRefNumber,PER.IdNumber) as IsUploaded) AS chkCC
	--	LEFT JOIN [client].[RolePlayerAddress]  as RPA (Nolock) ON RPA.RoleplayerId = PE.ClaimantId
	--	Where pe.IsStraightThroughProcess = 1 AND CBC.IsStraightThroughProcessBenefit = 1 
	--	AND PE.CompCarePersonEventId is Not null AND CP.IsStraightThroughProcess IS NULL
	--	AND CBC.ClaimBucketClassId != 15 AND PE.SuspiciousTransactionStatusId = 0 AND C.ClaimStatusId = 6
	--	AND ClaimLiabilityStatusId = 5
	--	AND chkCC.IsUploaded = 1 AND PE.CreatedDate > '2022-12-15 18:44:53.537'
	--	--DATEDIFF(day,PE.CreatedDate, GetDate()) > 90
	--END

	--INTERNAL MODERNIZATION CLAIMS
	--Accommodated claims at the PEV stage
	SELECT DISTINCT TOP 10
			 C.ClaimId AS ClaimId
			 ,CASE WHEN C.ClaimReferenceNumber IS NULL 
			       THEN PE.PersonEventReferenceNumber
                   ELSE C.ClaimReferenceNumber
                   END AS ClaimReferenceNumber
			,PE.PersonEventId AS PersonEventId
			,PE.ClaimantId AS ClaimantId
			,PE.InsuredLifeId AS InsuredLifeId
			,PO.[Code] AS ProductCode
			,PER.IsVopdVerified AS IsVopdVerified
			,PER.IsAlive AS IsAlive
			,PER.IdTypeId AS IdType
			,PE.SuspiciousTransactionStatusId AS SuspiciousTransactionStatus
			,PER.Firstname AS EmployerFirstName
			,PER.Surname AS EmployeeSurname
			,ISNULL(R.PreferredCommunicationTypeId,4) AS CommunicationType
			,R.EmailAddress AS EmployeeEmailAddress
			,R.CellNumber AS EmployeeCellNumber
			,ISNULL(PER.TitleId,6) AS Title
			,E.EventDate AS EventDate
			,COM.[Name] AS CompanyName
			,COM.[ReferenceNumber] AS CompanyReferenceNumber
			,RPA.AddressLine1 AS CompanyAddressLine1
			,RPA.City AS CompanyCity
			,RPA.PostalCode AS CompanyPostalCode
			,0 as PolicyId
			,(CASE 
				WHEN PCR.PersonEventId IS NOT NULL
				THEN CAST(1 AS BIT)
					ELSE CAST(0 AS BIT)
				END) 
			 AS [DocumentsBeenUploaded]
			,PE.CompCarePEVRefNumber AS CompCarePEVRefNumber
			,PER.IdNumber AS EmployeeIdNumber

		FROM [claim].[PersonEvent]				AS PE	(NOLOCK)
		INNER JOIN [claim].[Event]				AS E	(NOLOCK) ON E.EventId = PE.EventId
		INNER JOIN [claim].[ClaimBucketClass]	AS CBC	(NOLOCK) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
		LEFT  JOIN [claim].[Claim]				AS C	(NOLOCK) ON C.PersonEventId = PE.PersonEventId
		INNER JOIN [client].Person				AS PER  (NOLOCK) ON PER.RolePlayerId = PE.InsuredLifeId
		INNER JOIN [client].[Company]			AS COM  (NOLOCK) ON COM.RolePlayerId = PE.ClaimantId
		INNER JOIN [client].[RolePlayer]		AS R	(NOLOCK) ON R.RolePlayerId = PE.InsuredLifeId	
		LEFT JOIN [client].[RolePlayerAddress]  AS RPA	(NOLOCK) ON RPA.RoleplayerId = PE.ClaimantId
		INNER JOIN policy.[Policy]				AS P (NOLOCK) ON P.PolicyOwnerId = PE.CompanyRolePlayerId
		LEFT JOIN [product].[ProductOption]		AS PO (NOLOCK) ON PO.Id = P.ProductOptionId
		LEFT JOIN [product].[Product]			AS PR (NOLOCK) ON PR.Id = PO.ProductId
		-- filter and include only records where documents have been uploaded
		INNER JOIN (
			SELECT DISTINCT PersonEventId
			FROM claim.PersonEventClaimRequirement (NOLOCK)
			WHERE IsMinimumRequirement = 1 --(329)First Medical Report Outstanding, (141)Passport Document Outstanding
				AND DateClosed IS NOT NULL
				GROUP BY PersonEventId
				HAVING COUNT(DISTINCT ClaimRequirementCategoryId) > 2 -- ensure both categories are present
			) AS PCR ON PE.PersonEventId = PCR.PersonEventId

		WHERE   PE.CompCarePersonEventId IS NULL 
			AND CBC.ClaimBucketClassId <> 15 
			AND PE.SuspiciousTransactionStatusId = 0 
			AND PO.[Code] = 'EMP'
			AND (C.ClaimStatusId = 6 OR PE.PersonEventStatusId = 2) -- Closed
		ORDER BY  PE.PersonEventId DESC;
END