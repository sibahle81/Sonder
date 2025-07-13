SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Surya Ratheesh>
-- Create date: <23/06/2025>
-- Description:	<To Get Get Pensioner Medication And Sundries Details>
-- =============================================
CREATE PROCEDURE medical.GetPensionerMedicationAndSundriesDetails
    @ClaimReferenceNumber VARCHAR(50) = NULL -- K/64732/64732/003A/82/WMP'
AS

BEGIN
SET NOCOUNT ON;
    SELECT DISTINCT
      
	(Per.FirstName + ' ' + Per.Surname) AS sPatientName, 
        C.ClaimReferenceNumber AS sMainClaimFileRef,
		PC.PensionCaseNumber As sPensionFullReferenceNumber,
		PAC.ICD10Code AS sPensionerNumber,
		CAST(GETDATE() AS DATE) AS dtDocDate
		
	FROM 
        [claim].[Claim] C WITH (NOLOCK)
		INNER JOIN [pension].[PensionClaimMap] PCM ON C.ClaimReferenceNumber = PCM.ClaimReferenceNumber
		INNER JOIN [pension].[Pensioner] P ON PCM.PensionClaimMapId = P.PensionClaimMapId
		INNER JOIN [client].[Person] Per ON P.PersonId = Per.RolePlayerId 
		INNER JOIN [pension].[pensioncase] PC ON PCM.PensionCaseId = PC.PensionCaseId
		INNER JOIN [medical].[PreAuthorisation] PA ON c.ClaimId = PA.ClaimId
		INNER JOIN [medical].[PreAuthICD10Code] PAC ON PA.PreAuthId = PAC.PreAuthId
	WHERE
       C.ClaimReferenceNumber = @ClaimReferenceNumber;


END
GO
