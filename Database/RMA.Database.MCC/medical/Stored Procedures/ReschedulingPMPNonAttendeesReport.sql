CREATE PROCEDURE [medical].[ReschedulingPMPNonAttendeesReport] 
@StartDate DATE,
@EndDate DATE           
AS

BEGIN
-- EXEC medical.ReschedulingPMPNonAttendeesReport '01-01-2020','12-12-2020'

	SELECT cb.PersonId,
		icddg.Code AS DRGCode,
		ISNULL(per.Surname, '') + ' ' + ISNULL(per.FirstName, '') AS Name,
		penc.PensionCaseNumber,
		cs.ScheduledDate AS actScheduleDate,
		cv.Name AS ScheduledVenue,
		cs1.ScheduledDate AS ReScheduleDate,
		cv1.Name AS ReScheduleVenue,
		icd.ICD10Code,
		icd.ICD10CodeDescription AS ICD10Description,
		e.EventDate
	FROM [pension].[Pensioner] pen
		INNER JOIN [client].[Person] per ON per.RolePlayerId = pen.PersonId
		INNER JOIN [pension].[PensionClaimMap] pcm ON pcm.PensionClaimMapId = pen.PensionClaimMapId
		INNER JOIN [pension].[PensionCase] penc ON penc.PensionCaseID = pcm.PensionCaseId
		
		INNER JOIN [claim].[Claim] clm ON clm.ClaimId = pcm.ClaimId
		INNER JOIN [claim].[PersonEvent] pe ON pe.PersonEventId = clm.PersonEventId
		INNER JOIN [claim].[PhysicalDamage] pd ON pd.PersonEventId = pe.PersonEventId
		INNER JOIN [claim].[Event] e ON e.[EventId] = pe.EventId

		INNER JOIN [claim].[Injury] inj ON inj.PhysicalDamageId = pd.PhysicalDamageId
		INNER JOIN [medical].[ICD10Code] icd ON icd.ICD10CodeID = inj.ICD10CodeId
		INNER JOIN [medical].[ICD10GroupMap] icdgm ON icdgm.ICD10CodeId = icd.ICD10CodeID
		INNER JOIN [medical].[ICD10DiagnosticGroup] icddg ON icddg.ICD10DiagnosticGroupID = icdgm.ICD10DiagnosticGroupId

		INNER JOIN [medical].[ICD10SubCategory] sub ON sub.ICD10SubCategoryId = icd.ICD10SubCategoryId
		INNER JOIN [medical].[ICD10Category] cat ON cat.ICD10CategoryId = sub.ICD10CategoryId
		      
		INNER JOIN [medical].[ClinicBooking] cb ON cb.PersonId = per.RolePlayerId
		INNER JOIN [medical].[ClinicSchedule] cs ON cs.ClinicScheduleId = cb.ClinicScheduleId
		INNER JOIN [medical].[ClinicVenue] cv ON cv.ClinicVenueID = cs.ClinicVenueId
		 
		LEFT OUTER JOIN [medical].[ClinicBooking] cb1 ON cb.PersonID = cb1.PersonID
			AND cb1.ClinicBookingId > cb.ClinicBookingId
			AND cb1.ClinicBookingId = (SELECT TOP 1 ClinicBookingId FROM [medical].[ClinicBooking] WHERE PersonID = cb.PersonID AND ClinicBookingId > cb.ClinicBookingId)      
			AND cb.IsActive = 1
		LEFT OUTER JOIN [medical].[ClinicSchedule] cs1 ON cb1.ClinicScheduleId = cs1.ClinicScheduleId
		LEFT OUTER JOIN [medical].[ClinicVenue] cv1 ON cs1.ClinicVenueId = cv1.ClinicVenueId
	WHERE pen.IsDeleted = 0 AND per.IsDeleted = 0 AND pcm.IsDeleted = 0 AND penc.IsDeleted = 0 AND
	    clm.IsDeleted = 0 AND pe.IsDeleted = 0 AND pd.IsDeleted = 0 AND inj.IsDeleted = 0 AND 
		cb.IsDeleted = 0 AND cs.IsDeleted = 0 AND cv.IsDeleted = 0 AND
		pen.AttendedClinic = 0 AND cs.ScheduledDate BETWEEN @StartDate AND @EndDate AND cb.IsApproved = 1

END