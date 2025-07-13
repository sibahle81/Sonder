CREATE PROC [claim].[GetCompCareMedicalReports]
	@CompCarePersonEventId INT
AS
BEGIN
/*
 exec [claim].[GetCompCareMedicalReports] 1598087
*/

CREATE TABLE #CompCareMedicalReports(
    CompCarePersonEventId int null,
    ICD10Codes  varchar(50) NULL,
    ICD10DiagnosticGroupId int NULL,
    ReportDate datetime NOT NULL,
    MedicalReportTypeId int NULL
	)

	insert into #CompCareMedicalReports
    SELECT MR.PersonEventID as CompCarePersonEventId, 
	   mr.ICD10Codes as ICD10Codes,
	   (Select ICD10DiagnosticGroupId from [medical].[ICD10DiagnosticGroup] where code = DRG.Code) as ICD10DiagnosticGroupId,
	   mr.ReportDate as ReportDate,
	   MedicalReportTypeID as MedicalReportTypeId
						 FROM [Medical].[CompCareMedicalReport] mr
						 inner Join [claim].[CompCarePhysicalDamage] PD on mr.PersonEventId = PD.PersonEventId
						 inner Join [Medical].[CompCareICD10DiagnosticGroup] DRG on PD.ICD10DiagnosticGroupId = DRG.ICD10DiagnosticGroupId
						 WHERE mr.PersonEventID = @CompCarePersonEventId AND 
								  mr.MedicalReportTypeID in (1,2,3) AND
								  mr.IsActive = 1 AND mr.ReportStatus = 2


	IF (not exists (select 1 from #CompCareMedicalReports))
	BEGIN

	Declare @CompCareClaimNumber varchar(50),
			@IdNumber varchar(50),
			@ICD10DiagnosticGroupId int

		Select @CompCareClaimNumber = PE.CompCarePEVRefNumber, 
			   @IdNumber = P.IdNumber,
			   @ICD10DiagnosticGroupId = PD.ICD10DiagnosticGroupId
		from Claim.PersonEvent PE
		inner Join Claim.PhysicalDamage PD on PE.PersonEventId = PD.PersonEventId
		inner Join client.Person P on PE.insuredLifeId = p.RolePlayerId 
		where CompCarePersonEventId = @CompCarePersonEventId
		
		insert into #CompCareMedicalReports
		select @CompCarePersonEventId as CompCarePersonEventId, 
			   CI.ICD10Codes as ICD10Codes,
			   @ICD10DiagnosticGroupId as ICD10DiagnosticGroupId,
			   CI.ReportDate as ReportDate,
			   1 as MedicalReportTypeId  
			   from [Imaging].[ClaimsImage] CI
			INNER JOIN [Imaging].[Master] M ON ci.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			M.DocumentTypeId in (29,337)
			AND CI.claimNumber = @CompCareClaimNumber
			AND (CI.Idnumber = @IdNumber or ci.PassPortNumber = @IdNumber)
			AND CI.ReportDate is not null
			order by 1 desc

			IF (not exists (select 1 from #CompCareMedicalReports))
			BEGIN
			 insert into #CompCareMedicalReports
			 select @CompCarePersonEventId as CompCarePersonEventId, 
			   MI.ICD10Codes as ICD10Codes,
			   @ICD10DiagnosticGroupId as ICD10DiagnosticGroupId,
			   MI.ReportDate as ReportDate,
			   1 as MedicalReportTypeId  
			   from [Imaging].[MedicalImage] MI
			INNER JOIN [Imaging].[Master] M ON MI.Id = m.Id
			INNER JOIN [Imaging].[Image] I ON m.ImageId = i.Id
			Where
			--M.DocumentTypeId in (29,337)
			MI.claimNumber = @CompCareClaimNumber
			AND (MI.Idnumber = @IdNumber or MI.PassPortNumber = @IdNumber)
			AND MI.ReportDate is not null
			order by 1 desc
			END
	END

	

	Select * from #CompCareMedicalReports
	drop table #CompCareMedicalReports
END
