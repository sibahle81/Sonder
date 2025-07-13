CREATE PROCEDURE [medical].[CompletedServicesReport]
@ServiceYear INT = NULL,
@PMPRegionID INT = NULL,
@ICD10DiagnosticGroupId INT = NULL
    
AS
BEGIN
	/*
	[medical].[CompletedServicesReport] 2024, null, null
	*/

		SET NOCOUNT ON

		CREATE TABLE #Visits
		(
			ROW INT IDENTITY(1,1),
			PMPRegion VARCHAR(100),
			DRGGroup VARCHAR(100),
			Location VARCHAR(255),
			PensionerName VARCHAR(120),
			PensionCaseNumber VARCHAR(17),
			ServiceDate DATE,
			IndustryNumber VARCHAR(15),
			MedicalReportDate DATE,
			MedicalReportType VARCHAR(50),
			ServiceType VARCHAR(50),
			MobileClinic VARCHAR(255)
		)

		INSERT INTO #Visits
		SELECT DISTINCT
        CASE WHEN ISNULL(rpa.PostalCode, '') <> '' THEN [common].[GetPMPRegionDetailForPostalCode](rpa.PostalCode) ELSE pmpr.Name END AS PMPRegion,
		ISNULL(idg.Code, '') AS DRGGroup,
		ISNULL(rpa.AddressLine2, tl.BranchName) AS Location,
		ISNULL(per.Surname, '') + ' ' + ISNULL(per.FirstName, '') AS PensionerName,
		pc.PensionCaseNumber,
		CAST(v.DateVisited AS DATE) AS ServiceDate,
		pem.EmployeeIndustryNumber AS IndustryNumber,    
		NULL,
		NULL,
		MS.Name AS ServiceType,
		ISNULL(cv.Name, '') AS MobileClinic
		FROM [pension].[PensionClaimMap] cm
		INNER JOIN [pension].[PensionCase] pc ON cm.PensionCaseId = pc.PensionCaseId
		INNER JOIN [pension].[Pensioner] pr ON cm.PensionClaimMapId = pr.PensionClaimMapId
		INNER JOIN [client].[Person] per ON pr.PersonId = per.RolePlayerId
		INNER JOIN [client].[PersonEmployment] pem ON pr.PersonId = pem.EmployeeRolePlayerId
		INNER JOIN [pension].[Visit] v ON pr.PensionerId = v.PensionerId
		INNER  JOIN [medical].[Service] ms ON MS.ServiceId = v.ServiceId
		LEFT JOIN [medical].[ClinicVenue] cv (NOLOCK) ON v.ClinicVenueId = cv.ClinicVenueID
		LEFT JOIN [pension].[TebaLocation] tlc (NOLOCK) ON cv.TebaLocationID = tlc.TebaLocationID
		LEFT JOIN [medical].[MobileClinicBookingType] mcbt (NOLOCK) ON cv.MobileClinicBookingTypeID = mcbt.MobileClinicBookingTypeId
		LEFT JOIN [medical].[ClinicBookingType] cbt (NOLOCK) ON cv.ClinicBookingTypeID = cbt.ClinicBookingTypeId
		LEFT JOIN [client].[RolePlayerAddress] rpa ON pr.PersonId = rpa.RolePlayerId AND rpa.IsPrimary = 1
		LEFT JOIN [pension].[TebaLocation] tl ON per.TebaLocationId = tl.TebaLocationID	
		LEFT JOIN [common].[PMPRegion] pmpr ON pmpr.PMPRegionID = tl.PMPRegionID
		INNER JOIN [claim].[Claim] c ON cm.ClaimId = c.ClaimId
		INNER JOIN [policy].[Policy] pol ON c.PolicyId = pol.PolicyId
		INNER JOIN [product].[ProductOption] po ON pol.ProductOptionId = po.Id
		INNER JOIN [product].[Product] p ON po.ProductId = p.Id
		INNER JOIN [claim].[PersonEvent] pev ON c.PersonEventId = pev.PersonEventId
		INNER JOIN [claim].[Event] evt ON evt.EventId = pev.EventId
		LEFT JOIN [claim].[MedicalReport] med ON pev.PersonEventId = med.PersonEventId
		INNER JOIN [claim].[ClaimBenefit] clb ON c.ClaimId = clb.ClaimId
		LEFT JOIN [claim].[Earnings] en ON pev.PersonEventId = en.PersonEventId
		LEFT JOIN [client].[PersonEmployment] pemp ON pemp.PersonEmpoymentId = pev.PersonEmploymentId
		LEFT JOIN [claim].[PhysicalDamage] pdam ON pev.PersonEventId = pdam.PersonEventId
		LEFT JOIN [claim].[Injury] inj ON inj.PhysicalDamageId = pdam.PhysicalDamageId
		LEFT JOIN [medical].[ICD10Code] icd ON icd.ICD10CodeID = inj.ICD10CodeId
		INNER JOIN [medical].[ICD10GroupMap] igm ON icd.ICD10CodeId = igm.ICD10CodeId  
		INNER JOIN [medical].[ICD10DiagnosticGroup] idg ON igm.ICD10DiagnosticGroupId = idg.ICD10DiagnosticGroupId
		LEFT JOIN [medical].[ServiceDRGGroup] sdg ON igm.ICD10DiagnosticGroupID = sdg.ICD10DiagnosticGroupID AND sdg.ServiceID > 1    
		LEFT JOIN [medical].[Service] s ON s.ServiceID = sdg.ServiceID
		WHERE pc.PensionCaseStatusId NOT IN (4, 6)
		  AND pc.PensionTypeId NOT IN (2, 6, 7, 8)  
		  AND DATEPART(YEAR, v.DateVisited) = @ServiceYear
		  AND idg.ICD10DiagnosticGroupId = CASE WHEN ISNULL(@ICD10DiagnosticGroupId, 0) > 0 THEN @ICD10DiagnosticGroupId ELSE idg.ICD10DiagnosticGroupId END    
		  AND (ISNULL(@PMPRegionID, 0) = 0 OR pmpr.PMPRegionID = @PMPRegionID)
		  AND cm.IsDeleted = 0
	  

	  DECLARE @TotalRecords INT, @Current INT = 0
	  SELECT @TotalRecords = COUNT(*) FROM #Visits 
  
	  WHILE @Current < @TotalRecords
	  BEGIN
		DECLARE @PensionCaseNumber VARCHAR(17),
			@ServiceDate DATE,
			@MedicalReportDate DATE = NULL,
			@MedicalReportType VARCHAR(50) = NULL
		
		SELECT @PensionCaseNumber = PensionCaseNumber, @ServiceDate = ServiceDate FROM #Visits WHERE ROW = @Current + 1

		SELECT @MedicalReportDate = MR.ReportDate, @MedicalReportType = MRT.Name 
		FROM pension.PensionCase PC
		INNER JOIN pension.PensionClaimMap PCM ON PC.PensionCaseId = PCM.PensionCaseId
		INNER JOIN claim.Claim C ON PCM.ClaimID = C.ClaimID
		INNER JOIN claim.MedicalReport MR ON C.PersonEventId = MR.PersonEventId
		INNER JOIN common.MedicalReportType MRT ON MR.MedicalReportTypeId = MRT.Id
		WHERE PC.PensionCaseNumber = @PensionCaseNumber
			AND CAST(MR.ReportDate AS DATE) BETWEEN CAST(DATEADD(DD, -30, @ServiceDate) AS DATE) AND CAST(DATEADD(DD, 30, @ServiceDate) AS DATE)
			AND MRT.Id = 8 --PMP
	
		IF @MedicalReportDate IS NOT NULL AND @MedicalReportType IS NOT NULL
		BEGIN
			UPDATE #Visits SET MedicalReportDate = @MedicalReportDate, MedicalReportType = @MedicalReportType WHERE ROW = @Current + 1 
		END

		SET @Current = @Current + 1
	  END 
 
	SELECT PMPRegion,
		DRGGroup,
		Location,
		PensionerName,
		PensionCaseNumber,
		ServiceDate,
		IndustryNumber,
		MedicalReportDate,
		MedicalReportType,
		ServiceType,
		MobileClinic
	FROM #Visits
  
  DROP TABLE #Visits

SET NOCOUNT OFF   

END