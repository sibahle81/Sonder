CREATE PROCEDURE [medical].[ChronicMedicationReport]
@StartDate DATE,          
@EndDate DATE
AS
BEGIN
--[medical].[ChronicMedicationReport] '01-01-2024', '10-09-2024'

	SELECT DISTINCT
		pc.PensionCaseNumber,
		pa.PreAuthNumber,
		pa.CreatedDate,
		CASE WHEN cmr.DateArrivedAtTEBA < @StartDate THEN NULL ELSE cmr.DateArrivedAtTEBA END AS DateArrivedAtTEBA,
		CASE WHEN cmr.DateCollected > @EndDate THEN NULL ELSE cmr.DateCollected END AS DateCollected,
		cmr.Comments,
		pa.DateAuthorisedFrom,
		pa.DateAuthorisedTo,
		ISNULL(per.Surname, '') + ' ' + ISNULL(per.FirstName, '') AS Name,
		ISNULL(tl.BranchName, '') AS BranchName
	FROM Medical.PreAuthorisation pa
	INNER JOIN Medical.ChronicMedicationReceipt cmr ON pa.PreAuthID = cmr.PreAuthID
	INNER JOIN Claim.Claim c ON pa.ClaimId = c.ClaimID
	INNER JOIN Claim.PersonEvent pe ON c.PersonEventID = pe.PersonEventID
	LEFT OUTER JOIN Pension.PensionClaimMap pcm ON c.ClaimID = pcm.ClaimID
	LEFT OUTER JOIN Pension.PensionCase pc ON pcm.PensionCaseId = pc.PensionCaseId
	LEFT OUTER JOIN Pension.Pensioner p ON pcm.PensionClaimMapId = p.PensionClaimMapId
	LEFT OUTER JOIN client.Person per ON p.PersonID = per.RolePlayerId
	LEFT OUTER JOIN pension.TebaLocation tl ON per.TebaLocationId = tl.TebaLocationID
	WHERE cmr.IsDeleted = 0 AND pa.IsDeleted = 0 AND 
	  (cmr.DateArrivedAtTEBA BETWEEN @StartDate AND @EndDate
	   OR cmr.DateCollected BETWEEN @StartDate AND @EndDate)
   
END