CREATE PROCEDURE [medical].[ServiceSchedulingReport]
(
	@ICD10DiagnosticGroupId INT = NULL,
	@PMPRegionID INT = NULL,
	@StartDate DATE,
	@EndDate DATE
)
AS
BEGIN
 /*
 EXEC [medical].[ServiceSchedulingReport]
		@ICD10DiagnosticGroupId = null,
		@PMPRegionID = null,
		@StartDate = '2024-01-01',
		@EndDate = '2026-10-31'
		*/

    DECLARE @LEDGER_CLOSED_STATUS INT,
        @LEDGER_STOPPED_STATUS INT,
        @POSTAL_ADDRESSTYPE_ID INT,
        @PHYSICAL_ADDRESSTYPE_ID INT,
        @REGION_UNDEFINED VARCHAR(100)

    SET @LEDGER_CLOSED_STATUS = 4
    SET @LEDGER_STOPPED_STATUS = 6
    SET @POSTAL_ADDRESSTYPE_ID = 1
    SET @PHYSICAL_ADDRESSTYPE_ID = 2
    SET @REGION_UNDEFINED = 'Undefined'

    CREATE TABLE #ScheduledServices
        (
          PMP_Region VARCHAR(100),
          DRG_Group VARCHAR(10),
          TEBA_Description VARCHAR(100),
          Pensioner_Name VARCHAR(101),
          Pension_Number VARCHAR(17),
          Service_Description VARCHAR(255),
          Scheduled_Date DATETIME,
          Industry_number VARCHAR(15),
          ICD10_Description VARCHAR(100),
          Pension_Status VARCHAR(50),
          PersonId INT,
		  MobileClinic VARCHAR(255),
          PhysicalAddress1 VARCHAR(50),
          PhysicalAddress2 VARCHAR(50),
          PhysicalAddressCity VARCHAR(50),
          PhysicalAddressProvince VARCHAR(50),
          PhysicalAddressCode VARCHAR(20),
          PostalAddress1 VARCHAR(50),
          PostalAddress2 VARCHAR(50),
          PostalAddressCity VARCHAR(50),
          PostalAddressProvince VARCHAR(50),
          PostalAddressCode VARCHAR(20),
          ContactNumber VARCHAR(60)
        )

    INSERT  INTO #ScheduledServices
            ( PMP_Region,
              DRG_Group,
              TEBA_Description,
              Pensioner_Name,
              Pension_Number,
              Service_Description,
              Scheduled_Date,
              Industry_Number,
              ICD10_Description,
              Pension_Status,
			  PersonId,
			  MobileClinic
            )
            SELECT  DISTINCT
                    CASE WHEN ISNULL(rpa.PostalCode, '') <> '' THEN [common].[GetPMPRegionDetailForPostalCode](rpa.PostalCode) ELSE pmpr.Name END AS PMPRegion,
                    ISNULL(idg.Code, '') AS DRGGroup,
					ISNULL(rpa.AddressLine2, tl.BranchName) AS Location,
                    ISNULL(per.Surname, '') + ' ' + ISNULL(per.FirstName, '') AS PensionerName,
                    pc.PensionCaseNumber,
                    s.Description AS ServiceDescription,
                    pr.ScheduleDate AS ScheduledDate,
					pemp.EmployeeIndustryNumber AS IndustryNumber,
                    icd.ICD10CodeDescription AS ICD10CodeDescription,
                    pls.Name AS PensionLedgerStatus,
					pr.PersonId,
					ISNULL(tlc.BranchName, cv.Name) + ' - ' + CASE WHEN cv.ClinicBookingTypeID = 1 THEN cbt.Name ELSE ISNULL(mcbt.Name, '') END AS MobileClinic
            FROM    [pension].[Ledger] pl (NOLOCK)
                    INNER JOIN [pension].[PensionClaimMap] cm (NOLOCK) ON pl.PensionClaimMapId = cm.PensionClaimMapId
                    INNER JOIN [pension].[PensionCase] pc (NOLOCK) ON cm.PensioncaseId = pc.PensionCaseId
                    INNER JOIN [pension].[Pensioner] pr (NOLOCK) ON cm.PensionClaimMapId = pr.PensionClaimMapId and pr.IsScheduleON = 1 --ONLY show active schedules
					INNER JOIN [client].[Person] per (NOLOCK) ON pr.PersonId = per.RolePlayerId
					INNER JOIN [claim].[Claim] c (NOLOCK) ON cm.ClaimId = c.ClaimId
					INNER JOIN [claim].[PersonEvent] pev (NOLOCK) ON c.PersonEventId = pev.PersonEventId
					LEFT JOIN [client].[RolePlayerAddress] rpa (NOLOCK) ON pr.PersonId = rpa.RolePlayerId AND rpa.IsPrimary = 1
					LEFT JOIN [pension].[TebaLocation] tl (NOLOCK) ON per.TebaLocationId = tl.TebaLocationID	
					LEFT JOIN [common].[PMPRegion] pmpr (NOLOCK) ON tl.PMPRegionID = pmpr.PMPRegionID
					LEFT JOIN [client].[PersonEmployment] pemp (NOLOCK) ON pev.PersonEmploymentId = pemp.PersonEmpoymentId
					LEFT JOIN [claim].[PhysicalDamage] pdam (NOLOCK) ON c.PersonEventId = pdam.PersonEventId
					LEFT JOIN [claim].[Injury] inj (NOLOCK) ON pdam.PhysicalDamageId = inj.PhysicalDamageId
					LEFT JOIN [medical].[ICD10Code] icd (NOLOCK) ON inj.ICD10CodeId = icd.ICD10CodeID
					INNER JOIN [medical].[ICD10GroupMap] igm (NOLOCK) ON icd.ICD10CodeId = igm.ICD10CodeId  
					INNER JOIN [medical].[ICD10DiagnosticGroup] idg (NOLOCK) ON igm.ICD10DiagnosticGroupId = idg.ICD10DiagnosticGroupId
					LEFT JOIN [medical].[ServiceDRGGroup] sdg (NOLOCK) ON igm.ICD10DiagnosticGroupID = sdg.ICD10DiagnosticGroupID AND sdg.ServiceId <> 1
					LEFT JOIN [medical].[Service] s (NOLOCK) ON s.ServiceID = sdg.ServiceID
                    LEFT JOIN [pension].[Visit] v (NOLOCK) ON pr.PensionerId = v.PensionerId
					LEFT JOIN [medical].[ClinicVenue] cv (NOLOCK) ON v.ClinicVenueId = cv.ClinicVenueID
					LEFT JOIN [pension].[TebaLocation] tlc (NOLOCK) ON cv.TebaLocationID = tlc.TebaLocationID
					LEFT JOIN [medical].[MobileClinicBookingType] mcbt (NOLOCK) ON cv.MobileClinicBookingTypeID = mcbt.MobileClinicBookingTypeId
					LEFT JOIN [medical].[ClinicBookingType] cbt (NOLOCK) ON cv.ClinicBookingTypeID = cbt.ClinicBookingTypeId
                    LEFT JOIN [common].[PensionLedgerStatus] pls (NOLOCK) ON pl.PensionLedgerStatusId = pls.Id
            WHERE   ( ( pl.PensionLedgerStatusId != @LEDGER_CLOSED_STATUS ) AND ( pl.PensionLedgerStatusId != @LEDGER_STOPPED_STATUS ) )
                    AND pr.ScheduleDate BETWEEN @StartDate AND @EndDate
                    AND pr.ScheduleDate >= ISNULL((SELECT MAX(DateVisited) FROM [pension].[Visit] WHERE PensionerId = pr.PensionerId), GETDATE())
                    AND idg.ICD10DiagnosticGroupId = CASE WHEN ISNULL(@ICD10DiagnosticGroupId, 0) > 0 THEN @ICD10DiagnosticGroupId ELSE idg.ICD10DiagnosticGroupId END    
					AND (ISNULL(@PMPRegionID, 0) = 0 OR pmpr.PMPRegionID = @PMPRegionID)
					AND pc.PensionTypeID in (1, 3, 4, 5, 10) AND ISNULL(v.ClinicVenueId, 0) > 0
/*
1	Disability
3	Special Allowance
4	Disability DO
5	Disability DU
10	Disability DB
*/

---------------------Postal Address Details
    UPDATE  #ScheduledServices
    SET     PostalAddress1 = rpa.AddressLine1,
            PostalAddress2 = rpa.AddressLine2,
            PostalAddressCity = rpa.City,
            PostalAddressProvince = rpa.Province,
            PostalAddressCode =  rpa.PostalCode
    FROM    #ScheduledServices (NOLOCK)
            INNER JOIN [client].[RolePlayerAddress] rpa (NOLOCK) ON #ScheduledServices.PersonId = rpa.RolePlayerId
    WHERE	rpa.AddressTypeId = @POSTAL_ADDRESSTYPE_ID

--------------------Physical Address Details

    UPDATE  #ScheduledServices
    SET     PhysicalAddress1 = rpa.AddressLine1,
            PhysicalAddress2 = rpa.AddressLine2,
            PhysicalAddressCity = rpa.City,
            PhysicalAddressProvince = rpa.Province,
            PhysicalAddressCode = rpa.PostalCode
    FROM    #ScheduledServices (NOLOCK)
            INNER JOIN [client].[RolePlayerAddress] rpa (NOLOCK) ON #ScheduledServices.PersonId = rpa.RolePlayerId
    WHERE	rpa.AddressTypeId = @PHYSICAL_ADDRESSTYPE_ID

    UPDATE  #ScheduledServices
    SET     ContactNumber = rpa.ContactNumber
    FROM    #ScheduledServices (NOLOCK)
            INNER JOIN [client].[RolePlayerContact] rpa (NOLOCK) ON #ScheduledServices.PersonId = rpa.RolePlayerId
    WHERE   rpa.CommunicationTypeId = 2
	
--Result Set
    SELECT  CASE WHEN ISNULL(PMP_Region, '') = '' THEN @REGION_UNDEFINED ELSE PMP_Region END AS PMP_Region,
            DRG_Group,
            TEBA_Description,
            Pensioner_Name,
            Pension_Number,
            Service_Description,
            CONVERT(VARCHAR(20), Scheduled_Date, 106) AS Scheduled_Date,
            Industry_number,
            ICD10_Description,
            Pension_Status,
            PersonId,
			MobileClinic,
			PhysicalAddress1,
            PhysicalAddress2,
            PhysicalAddressCity,
            PhysicalAddressProvince,
            PhysicalAddressCode,
            PostalAddress1,
            PostalAddress2,
            PostalAddressCity,
            PostalAddressProvince,
            PostalAddressCode,
            ContactNumber
    FROM    #ScheduledServices
    ORDER BY PMP_Region,
            DRG_Group,
            TEBA_Description,
            Pensioner_Name,
            Scheduled_Date

    DROP TABLE #ScheduledServices

END