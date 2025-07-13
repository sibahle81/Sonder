CREATE PROCEDURE [claim].[GetPensionClaimPdRecoveries] @RolePlayerId int
AS
BEGIN

SELECT PE.PersonEventId, C.ClaimId, C.ClaimReferenceNumber, PO.Code AS 'ProductCode', E.EventDate AS 'DateOfAccident', FMRF.DateStabilised AS 'DateOfStabilisation',PDA.ClaimInvoiceId, 
	pe.InsuredLifeId AS 'RolePlayerId', PDA.AwardPercentage AS 'PdPercentage', pda.AwardAmount AS 'PdLumpSumAmount', '0' IndustryNumber, '' AS 'Member'
FROM [claim].[Claim](NOLOCK) C
	INNER JOIN [claim].[PersonEvent] PE(NOLOCK) ON PE.PersonEventId = C.PersonEventId
	INNER JOIN [claim].[Event] E(NOLOCK) ON E.EventId = PE.EventId
	INNER JOIN [claim].[PDAward] PDA(NOLOCK) ON C.ClaimId = PDA.ClaimId
	INNER JOIN [claim].[ClaimInvoice] CI(NOLOCK) ON C.ClaimId = CI.ClaimId
	INNER JOIN [policy].[Policy] P(NOLOCK) ON P.PolicyId = C.PolicyId
	INNER JOIN [product].[ProductOption] PO(NOLOCK) ON PO.Id = P.ProductOptionId
	INNER JOIN [digi].[MedicalReportForm] MRF(NOLOCK) ON C.PersonEventId = MRF.PersonEventId
	INNER JOIN [digi].[FinalMedicalReportForm] FMRF(NOLOCK) ON MRF.MedicalReportFormId = FMRF.MedicalReportFormId
WHERE PE.InsuredLifeId = @RolePlayerId

END

