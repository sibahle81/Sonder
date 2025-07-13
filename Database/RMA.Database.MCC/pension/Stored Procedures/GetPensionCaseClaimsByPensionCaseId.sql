CREATE PROCEDURE [pension].[GetPensionCaseClaimsByPensionCaseId] 
	@pensionCaseId INT
AS
BEGIN

	SELECT DISTINCT c.ClaimId, c.ClaimReferenceNumber, c.PersonEventId,
		pev.EventId,
		pc.PensionCaseNumber,
		c.DisabilityPercentage AS [DisabilityPercentage],
		p.Code AS [ProductCode],
		clb.EstimatedValue AS [EstimatedCV],
		evt.EventDate AS [DateOfAccident],
		med.StabilisedDate AS [DateOfStabilisation],
		ISNULL(en.Total,0) AS [Earnings], 
		ISNULL(pemp.EmployeeIndustryNumber,'') AS [IndustryNumber],
		pr.PensionerId
	FROM [pension].[PensionClaimMap] cm
		INNER JOIN [pension].[PensionCase] pc ON cm.PensionCaseId = pc.PensionCaseId
		INNER JOIN [pension].[Pensioner] pr ON cm.PensionClaimMapId = pr.PensionClaimMapId
		INNER JOIN [client].[Person] per ON pr.PersonId = per.RolePlayerId
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
	WHERE cm.PensionCaseId = @pensionCaseId
		AND cm.IsDeleted = 0 
		AND pc.IsDeleted = 0 
		AND pr.IsDeleted = 0 
		AND per.IsDeleted = 0 
		AND inj.IsDeleted = 0 
		AND c.IsDeleted = 0 
		AND pev.IsDeleted = 0 
		AND evt.IsDeleted = 0
		AND en.IsVerified = 1 AND en.EarningsTypeId = 1
END