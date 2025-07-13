CREATE Procedure [claim].[GetClaimsPendingAcknowledgement]
(
	@isNotificationOnly bit = 0
)
AS
/*
--Declare @isNotificationOnly bit
--Set @isNotificationOnly = 0

exec [claim].[GetClaimsPendingAcknowledgement] 1

*/

--Declare @isNotificationOnly bit
--Set @isNotificationOnly = 0

BEGIN

	CREATE TABLE #AdjudicateClaims(
    ClaimId int  NOT NULL,
    ClaimReferenceNumber varchar(50) NOT NULL,
    PersonEventId int NOT NULL,
    ClaimantId int NOT NULL,
    InsuredLifeId int NOT NULL,
    ProductCode varchar(50) NOT NULL,
    IsVopdVerified bit NOT NULL,
	IsAlive bit Not Null,
    IdType int NOT NULL,
    SuspiciousTransactionStatus int NOT NULL,
    EmployerFirstName varchar(50) NOT NULL,
    EmployeeSurname varchar(50) NOT NULL,
    CommunicationType int NOT NULL,
    EmployeeEmailAddress varchar(255) NULL,
    EmployeeCellNumber varchar(50) NULL,
    Title int NOT NULL,
    EventDate datetime NOT NULL,
    CompanyName varchar(255) NOT NULL,
    CompanyReferenceNumber varchar(50) NOT NULL,
    CompanyAddressLine1 varchar(255) NULL,
    CompanyCity varchar(50) NULL,
    CompanyPostalCode varchar(50) NULL,
    PolicyId int NULL,
    [DocumentsBeenUploaded] bit NOT NULL,
	CompCarePEVRefNumber varchar(25),
	EmployeeIdNumber varChar(20))

	IF(@isNotificationOnly = 0)
		Begin
			insert into #AdjudicateClaims
			Select 
				C.ClaimId as ClaimId,
				C.ClaimReferenceNumber as ClaimReferenceNumber,
				C.PersonEventId as PersonEventId ,
				PE.ClaimantId as ClaimantId,
				PE.InsuredLifeId as InsuredLifeId,
				ISNULL(PO.[Code],'EMP') as ProductCode,
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
			FROM claim.personEvent AS PE (Nolock)
			INNER JOIN [claim].[Event] AS E (Nolock) ON E.EventId = PE.EventId
			INNER JOIN [claim].[ClaimBucketClass] AS CBC (Nolock) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
			INNER JOIN [claim].[Claim] AS C (Nolock) ON C.PersonEventId = PE.PersonEventId
			INNER JOIN [policy].[Policy] AS P (Nolock) on P.PolicyOwnerId = PE.CompanyRolePlayerId
			INNER JOIN [client].Person as PER  (Nolock) on PER.RolePlayerId = PE.InsuredLifeId
			INNER JOIN [client].[Company] as COM  (Nolock) on COM.RolePlayerId = PE.ClaimantId
			INNER JOIN [client].[RolePlayer] as R (Nolock) on R.RolePlayerId = PE.InsuredLifeId
			LEFT JOIN [client].[RolePlayerAddress]  as RPA (Nolock) ON RPA.RoleplayerId = PE.ClaimantId
			LEFT JOIN [product].[ProductOption] as PO (Nolock) on PO.Id = P.ProductOptionId
			LEFT JOIN [product].[Product] as PR (Nolock) on PR.Id = PO.ProductId
			Where pe.IsStraightThroughProcess = 1 AND CBC.IsStraightThroughProcessBenefit = 1 --AND PR.ProductClassId = 1 
			AND CBC.ClaimBucketClassId != 15 AND PE.SuspiciousTransactionStatusId = 0 AND C.ClaimStatusId  IN (3,15,37,38,1,36) 
			AND PE.CompCarePEVRefNumber IS NULL

			insert into #AdjudicateClaims
			Select 
				C.ClaimId as ClaimId,
				C.ClaimReferenceNumber as ClaimReferenceNumber,
				C.PersonEventId as PersonEventId ,
				PE.ClaimantId as ClaimantId,
				PE.InsuredLifeId as InsuredLifeId,
				'EMP' as ProductCode,
				PER.IsVopdVerified as IsVopdVerified,
				PER.IsAlive as IsAlive,
				PER.IdTypeId as IdType,
				PE.SuspiciousTransactionStatusId as SuspiciousTransactionStatus,
				PER.Firstname as EmployerFirstName,
				PER.Surname as EmployeeSurname,
				ISNULL(R.PreferredCommunicationTypeId,4) as CommunicationType,
				CR.EmailAddress as EmployeeEmailAddress,
				R.CellNumber as EmployeeCellNumber,
				ISNULL(PER.TitleId,6) As Title,
				E.EventDate as EventDate,
				COM.[Name] as CompanyName,
				COM.[ReferenceNumber] as CompanyReferenceNumber,
				RPA.AddressLine1 as CompanyAddressLine1,
				RPA.City as CompanyCity,
				RPA.PostalCode as CompanyPostalCode,
				0 as PolicyId,
				cast(1 as bit) AS [DocumentsBeenUploaded],
				PE.CompCarePEVRefNumber as CompCarePEVRefNumber,
				PER.IdNumber as EmployeeIdNumber
			FROM claim.personEvent AS PE (Nolock)
			INNER JOIN compcare.personEvent AS CP (Nolock) ON PE.CompCarePersonEventId = CP.PersonEventId
			INNER JOIN [claim].[Event] AS E (Nolock) ON E.EventId = PE.EventId
			INNER JOIN [claim].[ClaimBucketClass] AS CBC (Nolock) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
			INNER JOIN [claim].[Claim] AS C (Nolock) ON C.PersonEventId = PE.PersonEventId
			INNER JOIN [client].Person as PER  (Nolock) on PER.RolePlayerId = PE.InsuredLifeId
			INNER JOIN [client].[Company] as COM  (Nolock) on COM.RolePlayerId = PE.ClaimantId
			INNER JOIN [client].[RolePlayer] AS CR (Nolock) on CR.RolePlayerId = PE.ClaimantId
			INNER JOIN [client].[RolePlayer] as R (Nolock) on R.RolePlayerId = PE.InsuredLifeId	
			CROSS APPLY(select  top 1  [claim].[CheckCompCareDocumentsUploadedFunction] (PE.CompCarePEVRefNumber,PER.IdNumber) as IsUploaded) AS chkCC
			LEFT JOIN [client].[RolePlayerAddress]  as RPA (Nolock) ON RPA.RoleplayerId = PE.ClaimantId
			Where pe.IsStraightThroughProcess = 1 AND CBC.IsStraightThroughProcessBenefit = 1
			AND PE.CompCarePersonEventId is Not null AND CP.IsStraightThroughProcess IS NULL
			AND CBC.ClaimBucketClassId != 15 AND PE.SuspiciousTransactionStatusId = 0 AND C.ClaimStatusId IN (3,15,37,38,1) 
			and chkCC.IsUploaded = 1
			ORDER BY C.ClaimStatusId DESC
		END
	ELSE 
	BEGIN
		insert into #AdjudicateClaims
		Select 
			C.ClaimId as ClaimId,
			C.ClaimReferenceNumber as ClaimReferenceNumber,
			C.PersonEventId as PersonEventId ,
			PE.ClaimantId as ClaimantId,
			PE.InsuredLifeId as InsuredLifeId,
			PO.[Code] as ProductCode,
			PER.IsVopdVerified as IsVopdVerified,
			PER.IsAlive as IsAlive,
			PER.IdTypeId as IdType,
			PE.SuspiciousTransactionStatusId as SuspiciousTransactionStatus,
			PER.Firstname as EmployeeFirstName,
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
			Cast(1 as Bit) AS [DocumentsBeenUploaded],
			PE.CompCarePEVRefNumber as CompCarePEVRefNumber,
			PER.IdNumber as EmployeeIdNumber
			FROM claim.personEvent AS PE (Nolock)
			INNER JOIN [claim].[Event] AS E (Nolock) ON E.EventId = PE.EventId
			INNER JOIN [claim].[ClaimBucketClass] AS CBC (Nolock) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
			INNER JOIN [claim].[Claim] AS C (Nolock)ON C.PersonEventId = PE.PersonEventId
			INNER JOIN [policy].[Policy] AS P(Nolock) on P.PolicyOwnerId = PE.CompanyRolePlayerId
			INNER JOIN [client].Person as PER (Nolock)on PER.RolePlayerId = PE.InsuredLifeId
			INNER JOIN [client].[Company] as COM (Nolock) on COM.RolePlayerId = PE.ClaimantId
			INNER JOIN [client].[RolePlayer] as R(Nolock) on R.RolePlayerId = PE.InsuredLifeId
			LEFT JOIN [client].[RolePlayerAddress] as RPA (Nolock)ON RPA.RoleplayerId = PE.ClaimantId
			INNER JOIN [product].[ProductOption] as PO(Nolock) on PO.Id = P.ProductOptionId
			INNER JOIN [product].[Product] as PR(Nolock) on PR.Id = PO.ProductId
		Where pe.IsStraightThroughProcess = 1 AND CBC.IsStraightThroughProcessBenefit = 1 AND PR.ProductClassId = 1 
		AND CBC.ClaimBucketClassId = 15 AND PE.SuspiciousTransactionStatusId = 0 AND C.ClaimStatusId NOT IN (40,41)

		insert into #AdjudicateClaims
			Select 
				C.ClaimId as ClaimId,
				C.ClaimReferenceNumber as ClaimReferenceNumber,
				C.PersonEventId as PersonEventId ,
				PE.ClaimantId as ClaimantId,
				PE.InsuredLifeId as InsuredLifeId,
				'EMP' as ProductCode,
				PER.IsVopdVerified as IsVopdVerified,
				PER.IsAlive as IsAlive,
				PER.IdTypeId as IdType,
				PE.SuspiciousTransactionStatusId as SuspiciousTransactionStatus,
				PER.Firstname as EmployerFirstName,
				PER.Surname as EmployeeSurname,
				ISNULL(R.PreferredCommunicationTypeId,4) as CommunicationType,
				CR.EmailAddress as EmployeeEmailAddress,
				R.CellNumber as EmployeeCellNumber,
				ISNULL(PER.TitleId,6) As Title,
				E.EventDate as EventDate,
				COM.[Name] as CompanyName,
				COM.[ReferenceNumber] as CompanyReferenceNumber,
				RPA.AddressLine1 as CompanyAddressLine1,
				RPA.City as CompanyCity,
				RPA.PostalCode as CompanyPostalCode,
				0 as PolicyId,
				Cast(1 as Bit) AS [DocumentsBeenUploaded],
				PE.CompCarePEVRefNumber as CompCarePEVRefNumber,
				PER.IdNumber as EmployeeIdNumber
			FROM claim.personEvent AS PE (Nolock)
			INNER JOIN [claim].[Event] AS E (Nolock) ON E.EventId = PE.EventId
			INNER JOIN [claim].[ClaimBucketClass] AS CBC (Nolock) ON PE.PersonEventBucketClassId = CBC.ClaimBucketClassId
			INNER JOIN [claim].[Claim] AS C (Nolock) ON C.PersonEventId = PE.PersonEventId
			INNER JOIN [client].Person as PER  (Nolock) on PER.RolePlayerId = PE.InsuredLifeId
			INNER JOIN [client].[Company] as COM  (Nolock) on COM.RolePlayerId = PE.ClaimantId
			INNER JOIN [client].[RolePlayer] AS CR (Nolock) on CR.RolePlayerId = PE.ClaimantId
			INNER JOIN [client].[RolePlayer] as R (Nolock) on R.RolePlayerId = PE.InsuredLifeId
			LEFT JOIN [client].[RolePlayerAddress]  as RPA (Nolock) ON RPA.RoleplayerId = PE.ClaimantId
			Where pe.IsStraightThroughProcess = 1 AND CBC.IsStraightThroughProcessBenefit = 1 AND PE.CompCarePersonEventId is Not null
		AND CBC.ClaimBucketClassId = 15 AND PE.SuspiciousTransactionStatusId = 0 AND C.ClaimStatusId NOT IN (40,41)

	END

	Select * from #AdjudicateClaims Order by ClaimId desc
	drop table #AdjudicateClaims
END