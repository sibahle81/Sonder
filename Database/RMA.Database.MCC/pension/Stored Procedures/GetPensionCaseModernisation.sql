CREATE PROCEDURE [pension].[GetPensionCaseModernisation] 
	@pensionCaseId INT
AS
BEGIN
	/*
	exec [pension].[GetPensionCaseModernisation] @pensionCaseId = 13293
	*/
	DECLARE @PensionerId INT, @PostalCode VARCHAR(15), @PMPRegionId INT, @PMPRegion VARCHAR(2048) = '', @PMPLocation VARCHAR(50) = '',
			@MCA VARCHAR(50) = '', @SPA VARCHAR(50) = '', @SPAID INT, @MCAID INT, @NextScheduleDate DATETIME

	SELECT TOP 1 @PensionerId = pr.PensionerId, @PostalCode = ISNULL(PostalCode, ''), @PMPLocation = rpa.AddressLine2
	FROM [pension].[PensionClaimMap] cm (NOLOCK)
	INNER JOIN [pension].[PensionCase] pc (NOLOCK) ON cm.PensionCaseId = pc.PensionCaseId
	INNER JOIN [pension].[Pensioner] pr (NOLOCK) ON cm.PensionClaimMapId = pr.PensionClaimMapId
	LEFT JOIN [client].[RolePlayerAddress] rpa (NOLOCK) ON pr.PersonId = rpa.RolePlayerId
	WHERE cm.PensionCaseId = @pensionCaseId 
	AND ISNULL(IsPrimary, 1) = 1

	IF (@PostalCode != '')
	BEGIN
		SELECT @PMPRegionId = PMPRegionId FROM common.PostalCodeRange (NOLOCK) WHERE @PostalCode between FromPostalCode AND ToPostalCode
	END

	IF (@PMPRegionId > 0)
	BEGIN
	
		SELECT @PMPRegion = Name FROM common.PMPRegion (NOLOCK) WHERE PMPRegionId = @PMPRegionId

		SELECT  @MCA = MCA.DisplayName,
                @MCAID = MCA.Id
        FROM    common.PMPRegion PMPR
                LEFT OUTER JOIN security.UserPMPRegion upmp (NOLOCK) ON PMPR.PMPRegionID = upmp.PMPRegionId
                LEFT OUTER JOIN security.[User] MCA (NOLOCK) ON MCA.Id = upmp.UserId
        WHERE   pmpr.PMPRegionID = @PMPRegionId
                AND MCA.Id in (SELECT TOP 2 RUR.Id
                                FROM      security.[User] RUR (NOLOCK)
                                WHERE     RUR.Id = MCA.Id
                                        AND RUR.IsActive = 1
                                        AND RUR.RoleId IN (SELECT TOP 2 Id
                                                            FROM     [security].[Role] (NOLOCK)
                                                            WHERE    [Name] IN ( 'Pensioner Medical Case Auditor', 'Medical Project Support')
															AND IsActive = 1))
                AND MCA.IsActive = 1
		ORDER BY upmp.PreferredMCA DESC

        SELECT  @SPA = (COALESCE(@SPA + '', '') + SPA.DisplayName + ', ' ) ,
                @SPAID = (COALESCE(@SPAID + '', '') + CAST(SPA.Id AS VARCHAR) + ', ' )
        FROM    security.[User] SPA (NOLOCK)
                INNER JOIN security.UserPMPRegion upmp (NOLOCK) ON upmp.UserId = SPA.Id
        WHERE   upmp.PMPRegionID = @PMPRegionId
                AND SPA.Id = (SELECT TOP 1 RUR.Id
                                FROM      [security].[User] RUR (NOLOCK)
                                WHERE     RUR.Id = SPA.Id
                                        AND RUR.IsActive = 1
                                        AND RUR.RoleId = (SELECT TOP 1 Id
                                                            FROM     [security].[Role] (NOLOCK)
                                                            WHERE    Name = 'Pension Service Administrator'))
                AND SPA.Id NOT IN (SELECT u.Id FROM [security].[User] U (NOLOCK) WHERE RoleId = (SELECT TOP 1 Id FROM [security].[Role] (NOLOCK) WHERE [Name] = 'Pensioner Medical Case Auditor'))
                AND SPA.IsActive = 1
		ORDER BY upmp.PreferredMCA DESC

	END

	IF (ISNULL(@PensionerId, 0) > 0)
	BEGIN
	 SELECT @NextScheduleDate = DATEADD(year, 2, MAX(DateVisited)) FROM pension.Visit (NOLOCK) WHERE PensionerId = @PensionerId 
		AND ServiceId IN (SELECT ServiceId FROM medical.Service WHERE Name IN ('Urological Review', 'Prosthetic Review')) AND IsDeleted = 0
	END

	SELECT DISTINCT
	c.ClaimId, 
	c.ClaimReferenceNumber,
	c.PersonEventId,
	pev.EventId,
	pc.PensionCaseNumber,
	c.DisabilityPercentage AS [DisabilityPercentage],
	p.Code AS [ProductCode],
	clb.EstimatedValue AS [EstimatedCV],
	evt.EventDate AS [DateOfAccident],
	med.StabilisedDate AS [DateOfStabilisation],
	ISNULL(en.Total,0) AS [Earnings], 
	ISNULL(pemp.EmployeeIndustryNumber,'') AS [IndustryNumber],
	ISNULL(icd.ICD10Code,'') AS [Icd10Driver],
	ISNULL(idg.Code, '') AS DRG,
	pr.PensionerId,
	ISNULL(@NextScheduleDate, pr.ScheduleDate) AS ScheduleDate,
	ISNULL(pr.IsScheduleON, 0) AS IsScheduleON,
	ISNULL(pr.AttendedClinic, 0) AS AttendedClinic, 
	ISNULL(pr.ExcludePMPSchedule, 0) AS ExcludePMPSchedule,
	s.[Name] AS ServiceName,
	@PMPLocation AS PMPLocation,
	@PMPRegion AS PMPRegion,
	@MCA AS PMPMCA,
	@SPA AS PMPSPA,
	ISNULL(per.TebaLocationId, 0) AS TebaLocationId,
	ISNULL(tl.BranchName, '') AS tebaBranchName,
	ISNULL(tl.Address1, '') AS tebaAddress,
	ISNULL(tl.City, '') AS tebaCity,
	ISNULL(rc.[Name], '') AS tebaProvince,
	ISNULL(cn.[Name], '') AS tebaCountry,
	ISNULL(tl.PostalCode, '') AS tebaPostalCode,
	ISNULL(pmpr.[Name], '') AS tebaPMPRegion
	FROM [pension].[PensionClaimMap] cm (NOLOCK)
	INNER JOIN [pension].[PensionCase] pc (NOLOCK) ON cm.PensionCaseId = pc.PensionCaseId
	INNER JOIN [pension].[Pensioner] pr (NOLOCK) ON cm.PensionClaimMapId = pr.PensionClaimMapId
	INNER JOIN [client].[Person] per (NOLOCK) ON pr.PersonId = per.RolePlayerId
	LEFT JOIN [pension].[TebaLocation] tl (NOLOCK) ON per.TebaLocationId = tl.TebaLocationID	
	LEFT JOIN common.Country cn (NOLOCK) ON cn.Id = tl.CountryID
	LEFT JOIN common.PMPRegion pmpr (NOLOCK) ON pmpr.PMPRegionID = tl.PMPRegionID
	LEFT JOIN common.RegionCode rc (NOLOCK) ON rc.RegionCodeID = tl.RegionCodeID
	INNER JOIN [claim].[Claim] c (NOLOCK) ON cm.ClaimId = c.ClaimId
	INNER JOIN [policy].[Policy] pol (NOLOCK) ON c.PolicyId = pol.PolicyId
	INNER JOIN [product].[ProductOption] po (NOLOCK) ON pol.ProductOptionId = po.Id
	INNER JOIN [product].[Product] p (NOLOCK) ON po.ProductId = p.Id
	INNER JOIN [claim].[PersonEvent] pev (NOLOCK) ON c.PersonEventId = pev.PersonEventId
	INNER JOIN [claim].[Event] evt (NOLOCK) ON evt.EventId = pev.EventId
	LEFT JOIN [claim].[MedicalReport] med (NOLOCK) ON pev.PersonEventId = med.PersonEventId
	INNER JOIN [claim].[ClaimBenefit] clb (NOLOCK) ON c.ClaimId = clb.ClaimId
	LEFT JOIN [claim].[Earnings] en (NOLOCK) ON (pev.PersonEventId = en.PersonEventId AND en.IsVerified = 1 AND en.EarningsTypeId = 1)
	LEFT JOIN [client].[PersonEmployment] pemp (NOLOCK) ON pemp.PersonEmpoymentId = pev.PersonEmploymentId
	LEFT JOIN [claim].[PhysicalDamage] pdam (NOLOCK) ON pev.PersonEventId = pdam.PersonEventId
	LEFT JOIN [claim].[Injury] inj (NOLOCK) ON inj.PhysicalDamageId = pdam.PhysicalDamageId
	LEFT JOIN [medical].[ICD10Code] icd (NOLOCK) ON icd.ICD10CodeID = inj.ICD10CodeId
	INNER JOIN [medical].[ICD10GroupMap] igm (NOLOCK) ON icd.ICD10CodeId = igm.ICD10CodeId  
	INNER JOIN [medical].[ICD10DiagnosticGroup] idg (NOLOCK) ON igm.ICD10DiagnosticGroupId = idg.ICD10DiagnosticGroupId
    LEFT JOIN [medical].[ServiceDRGGroup] sdg (NOLOCK) ON igm.ICD10DiagnosticGroupID = sdg.ICD10DiagnosticGroupID AND sdg.ServiceID > 1    
    LEFT JOIN [medical].[Service] s (NOLOCK) ON s.ServiceID = sdg.ServiceID
	WHERE cm.PensionCaseId = @pensionCaseId
	AND cm.IsDeleted = 0 
	AND pc.IsDeleted = 0 
	AND pr.IsDeleted = 0 
	AND per.IsDeleted = 0 
	AND inj.IsDeleted = 0 
	AND c.IsDeleted = 0 
	AND pev.IsDeleted = 0 
	AND evt.IsDeleted = 0

END
