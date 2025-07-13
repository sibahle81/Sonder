CREATE PROCEDURE [claim].[GetAccidentClaimsToAutoAcknowledge]
AS 
BEGIN

	SELECT  Distinct Top 5
			e.CreatedDate,
			C.ClaimId as ClaimId,
			C.ClaimReferenceNumber as ClaimReferenceNumber,
			C.PersonEventId as PersonEventId ,
			PE.ClaimantId as ClaimantId,
			PE.InsuredLifeId as InsuredLifeId,
			--PO.[Code] as ProductCode,
			'EMP' as ProductCode,
			PER.IsVopdVerified as IsVopdVerified,
			PER.IsAlive as IsAlive,
			PER.IdTypeId as IdType,
			PE.SuspiciousTransactionStatusId as SuspiciousTransactionStatus,
			PER.Firstname as EmployerFirstName,
			PER.Surname as EmployeeSurname,
			ISNULL(R.PreferredCommunicationTypeId,4) as CommunicationType,
			R.EmailAddress as EmployeeEmailAddress,
			R.CellNumber as EmployeeCellNumber,
			ISNULL(PER.TitleId,6) As Title,
			E.EventDate as EventDate,
			COM.[Name] as CompanyName,
			COM.[ReferenceNumber] as CompanyReferenceNumber,
			RPA.AddressLine1 as CompanyAddressLine1,
			RPA.City as CompanyCity,
			RPA.PostalCode as CompanyPostalCode,
			P.PolicyId as PolicyId,
			(Select CASE WHEN Count(D.Id) >= (Select Count(id) from documents.DocumentSetDocumentType where [Required] = 1 AND DocumentSetId LIKE
				CASE WHEN PER.IdTypeId = 1 THEN	38  ELSE 41 END) THEN Cast(1 as Bit) ELSE Cast(0 as Bit) END
			FROM documents.DocumentKeys AS DK 
			INNER JOIN documents.Document AS D ON D.Id = DK.DocumentId  
			LEFT JOIN documents.DocumentSetDocumentType AS DSDT ON DSDT.DocTypeId = D.DocTypeId
			where DK.KeyName in ('FirstMedicalReportId','PersonalClaimId') and KeyValue = CAST(PE.PersonEventId as varchar)  and D.DocumentStatusId = 6 And DSDT.DocumentSetId LIKE
			CASE WHEN PER.IdTypeId = 1 THEN 
				38 
				ELSE
				41
				END) AS [DocumentsBeenUploaded],
				PE.CompCarePEVRefNumber as CompCarePEVRefNumber,
				PER.IdNumber as EmployeeIdNumber
	FROM Claim.PersonEvent AS PE 
		INNER JOIN Claim.[Event] AS E ON e.EventId = PE.EventId
		INNER JOIN [claim].[ClaimBucketClass] AS CBC (Nolock) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
		INNER JOIN [claim].[Claim] AS C (Nolock) ON C.PersonEventId = PE.PersonEventId
		Left JOIN [policy].[Policy] AS P (Nolock) on P.PolicyOwnerId = PE.CompanyRolePlayerId
		INNER JOIN [client].Person as PER  (Nolock) on PER.RolePlayerId = PE.InsuredLifeId
		INNER JOIN [client].[Company] as COM  (Nolock) on COM.RolePlayerId = PE.ClaimantId
		INNER JOIN [client].[RolePlayer] as R (Nolock) on R.RolePlayerId = PE.InsuredLifeId
		LEFT JOIN [client].[RolePlayerAddress]  as RPA (Nolock) ON RPA.RoleplayerId = PE.ClaimantId
		LEFT JOIN [product].[ProductOption] as PO (Nolock) on PO.Id = P.ProductOptionId
		LEFT JOIN [product].[Product] as PR (Nolock) on PR.Id = PO.ProductId
		WHERE E.EventTypeId IN (1) AND e.IsDeleted = 0 AND PO.[Code] IS NOT NULL --AND LEN(PO.[name]) = 3
		AND C.ClaimStatusId in (1,2,15,36,37)	-- 1: New, 2: Received, 15: ReOpened, 36: Submitted, 37:Pending Acknowledgement
		--AND PE. PersonEventId in (23010992,23011001)
		order by e.CreatedDate desc
	

END