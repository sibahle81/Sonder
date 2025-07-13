CREATE PROCEDURE [claim].[GetCompCareDocumentsNotUploaded]
@CompcareClaimNumber varChar(150),
@IdNumber varchar(25)

AS
    BEGIN

	Declare @IdType int 
	Declare @IDDocumentsCount as int;
	Declare @PassportDocumentCount as int;
	Declare @FirstMedicalReportCount as int;
	Declare @CompCarePersonEventId int;

	Select @IdType = IdTypeId from client.Person where IdNumber = @IdNumber
	IF(@IdType = 1)
	Begin 
		select @IDDocumentsCount = Count(ci.id) from [Imaging].[ClaimsImage] CI
			INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			M.DocumentTypeId in (29,337)
			AND CI.claimNumber = @CompcareClaimNumber
			AND (CI.Idnumber = @IdNumber or ci.PassPortNumber = @IdNumber)
			order by 1 desc
		IF(@IDDocumentsCount = 0)
		BEGIN 
			select @IDDocumentsCount = Count(MI.id) from [Imaging].[MedicalImage] MI
			INNER JOIN [Imaging].[Master] M ON MI.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			MI.claimNumber = @CompcareClaimNumber
			AND (MI.Idnumber = @IdNumber or MI.PassPortNumber = @IdNumber)
			order by 1 desc
		END


	IF(@IDDocumentsCount = 0)
	BEGIN
	Select @CompCarePersonEventId = CompCarePersonEventId from Claim.PersonEvent where CompCarePEVRefNumber = @CompcareClaimNumber

	 SELECT @IDDocumentsCount = Count(MR.PersonEventID)
                         FROM [Medical].[CompCareMedicalReport] mr
                         inner Join [claim].[CompCarePhysicalDamage] PD on mr.PersonEventId = PD.PersonEventId
                         inner Join [Medical].[CompCareICD10DiagnosticGroup] DRG on PD.ICD10DiagnosticGroupId = DRG.ICD10DiagnosticGroupId
                         WHERE mr.PersonEventID = @CompCarePersonEventId AND
                                  mr.MedicalReportTypeID in (1) AND
                                  mr.IsActive = 1 AND mr.ReportStatus = 2

	END
	IF(@IDDocumentsCount = 0)
	Begin 
		Select
	 0 as Id,
	 ID as DocTypeId,
	 'ClaimManager' as SystemName, 
	 null as DocumentUri,
	 Null as VerifiedBy,
	 GetDate() as VerifiedByDate,
	 Null as FileHash,
	 'system' as [FileName],
	 'system' as [FileExtension],
	 2 as DocumentStatusId, 
	 0 as isDeleted,
	 'system' as CreatedBy,
	 GetDate() as CreateDate,
	 'system' as ModifiedBy,
	 GetDate() as ModifiedDate,
	 [name] as DocumentDescription from documents.DocumentType where name = 'First Medical Report'
    End

	END
	ELSE 
	Begin 
		select @PassportDocumentCount = Count(ci.id) from [Imaging].[ClaimsImage] CI
			INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			M.DocumentTypeId in (378,130,388,397,11,386,374)
			AND CI.claimNumber = @CompcareClaimNumber
			AND (CI.Idnumber = @IdNumber or ci.PassPortNumber = @IdNumber)
			order by 1 desc


			select @FirstMedicalReportCount = Count(ci.id) from [Imaging].[ClaimsImage] CI
			INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			M.DocumentTypeId in (29,337)
			AND CI.claimNumber = @CompcareClaimNumber
			AND (CI.Idnumber = @IdNumber or ci.PassPortNumber = @IdNumber)
			order by 1 desc

			IF(@FirstMedicalReportCount = 0)
			BEGIN 
			select @FirstMedicalReportCount = Count(MI.id) from [Imaging].[MedicalImage] MI
			INNER JOIN [Imaging].[Master] M ON MI.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			MI.claimNumber = @CompcareClaimNumber
			AND (MI.Idnumber = @IdNumber or MI.PassPortNumber = @IdNumber)
			order by 1 desc
			END

			IF(@FirstMedicalReportCount = 0)
			BEGIN 
			Select @CompCarePersonEventId = CompCarePersonEventId from Claim.PersonEvent where CompCarePEVRefNumber = @CompcareClaimNumber

	        SELECT @FirstMedicalReportCount = Count(MR.PersonEventID)
            FROM [Medical].[CompCareMedicalReport] mr
            inner Join [claim].[CompCarePhysicalDamage] PD on mr.PersonEventId = PD.PersonEventId
            inner Join [Medical].[CompCareICD10DiagnosticGroup] DRG on PD.ICD10DiagnosticGroupId = DRG.ICD10DiagnosticGroupId
            WHERE mr.PersonEventID = @CompCarePersonEventId AND
            mr.MedicalReportTypeID in (1) AND
            mr.IsActive = 1 AND mr.ReportStatus = 2
			END

	IF(@PassportDocumentCount = 0 AND @FirstMedicalReportCount = 0)
	Begin 
		Select
	 0 as Id,
	 ID as DocTypeId,
	 'ClaimManager' as SystemName, 
	 null as DocumentUri,
	 Null as VerifiedBy,
	 GetDate() as VerifiedByDate,
	 Null as FileHash,
	 'system' as [FileName],
	 'system' as [FileExtension],
	 2 as DocumentStatusId, 
	 0 as isDeleted,
	 'system' as CreatedBy,
	 GetDate() as CreateDate,
	 'system' as ModifiedBy,
	 GetDate() as ModifiedDate,
	 [name] as DocumentDescription
	 from documents.DocumentType where [name] in ('First Medical Report', 'PassPort Document')

    End
	ELSE IF(@PassportDocumentCount > 0 AND @FirstMedicalReportCount = 0)
	Begin
	 Select
	 0 as Id,
	 ID as DocTypeId,
	 'ClaimManager' as SystemName, 
	 null as DocumentUri,
	 Null as VerifiedBy,
	 GetDate() as VerifiedByDate,
	 Null as FileHash,
	 'system' as [FileName],
	 'system' as [FileExtension],
	 2 as DocumentStatusId, 
	 0 as isDeleted,
	 'system' as CreatedBy,
	 GetDate() as CreateDate,
	 'system' as ModifiedBy,
	 GetDate() as ModifiedDate,
	 [name] as DocumentDescription
	 from documents.DocumentType where [name] = 'First Medical Report' 
	End
	ELSE IF(@PassportDocumentCount = 0 AND @FirstMedicalReportCount > 0)
	Begin
	 Select
	 0 as [Id],
	 ID as [DocTypeId],
	 'ClaimManager' as [SystemName], 
	 null as [DocumentUri],
	 Null as [verifiedBy],
	 GetDate() as [verifiedByDate],
	 Null as [FileHash],
	 'system' as [FileName],
	 'system' as [FileExtension],
	 2 as [DocumentStatusId], 
	 0 as [IsDeleted],
	 'system' as [CreatedBy],
	 GetDate() as [CreatedDate],
	 'system' as [ModifiedBy],
	 GetDate() as [ModifiedDate],
	 [name] as [DocumentDescription] 
	 from documents.DocumentType where [name] = 'Passport Document' 
	End
	END
	END