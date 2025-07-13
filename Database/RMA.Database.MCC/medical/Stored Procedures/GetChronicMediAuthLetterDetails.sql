SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Gayathri
-- Date:        30/06/2025
-- Description: Get Hospital Auth Form Letter Details 
-- =============================================
--exec medical.GetChronicMediAuthLetterDetails PAC0221931

CREATE PROCEDURE medical.GetChronicMediAuthLetterDetails
    @PreAuthNumber VARCHAR(50) = NULL --PAC0221931
AS
BEGIN
    SET NOCOUNT ON; 

SELECT DISTINCT 
PA.PreAuthId						AS PreAuthId,
PA.PreAuthNumber					AS PreAuthNumber,
HP.Name								AS sAuthedMSPName,   
HP.PracticeNumber					AS sAuthedMSPPracticeNo,
HP.Name								AS sTDoctorName,
(Per.FirstName + ' ' + Per.Surname) AS sPatientName, 
C.ClaimReferenceNumber				AS sMainClaimFileRef,
P.PensionClaimMapId					AS sPensionFullReferenceNumber,
PA.DateAuthorisedFrom				AS dtAccidentDate,  
PA.DateAuthorisedFrom				AS dtDateAuthorised,
Per.DateOfBirth						AS dtDateOfBirth,   
Teb.TebaAuthID						AS sTebaAuthNumber,   
PA.PreAuthNumber					AS sPreAuthNumber,
PA.ModifiedBy						As sAuthUserName,
PA.HealthCareProviderID				AS sTDoctorAuthNumber,
PA.DateAuthorisedFrom				AS dtEffectiveDate,
PA.DateAuthorisedTo					AS dtTerminationDate,
CSM.ICD10CodeId                     AS sPrimaryICD10Code,
TB.Name                             AS sTreatmentBasket,
T.Code								AS sAuthTreatmentCode,
MI.ItemCode							AS sItemCode,
MI.Description						AS sDescription,
PE.EmployeeIndustryNumber           AS sIndustryNumber,
GETDATE()							AS dtGetDate,
CSM.NumberOfRepeats					AS sNoOfRepeats,
PAB.TariffAmount					AS crAmount

FROM medical.PreAuthorisation PA   
    INNER JOIN claim.Claim C							 ON PA.ClaimId = C.ClaimId
    INNER JOIN medical.HealthCareProvider HP			 ON PA.HealthCareProviderId = HP.Roleplayerid
	INNER JOIN medical.TebaAuthorisation_Temp Teb		 ON PA.PersonEventId = Teb.PersonEventID	
	INNER JOIN pension.PensionClaimMap PCM				 ON C.ClaimReferenceNumber = PCM.ClaimReferenceNumber
	INNER JOIN pension.Pensioner P						 ON PCM.PensionClaimMapId = P.PensionClaimMapId
    INNER JOIN client.Person PER						 ON P.PersonId = PER.RolePlayerId
	INNER JOIN medical.PreAuthICD10Code PAC				 ON PAC.PreAuthId = PA.PreAuthId
    INNER JOIN medical.PreAuthTreatmentBasket PTB		 ON PA.PreAuthId = PTB.PreAuthId
    INNER JOIN medical.TreatmentBasket TB				 ON PTB.TreatmentBasketId = TB.TreatmentBasketId
    INNER JOIN client.PersonEmployment PE				 ON PER.RolePlayerId = PE.EmployeeRolePlayerId
	INNER JOIN [medical].[PreAuthorisationBreakdown] PAB ON PAB.PreAuthId =  PA.PreAuthId  
	INNER JOIN medical.MedicalItem MI					 ON PAB.MedicalItemId = MI.MedicalItemId 
	INNER JOIN [medical].[TreatmentCode] T				 ON PAB.TreatmentCodeId = T.TreatmentCodeId 
	INNER JOIN [medical].[ChronicMedicationForm] CMF    on CMF.ClaimId = C.ClaimId	
	INNER JOIN [medical].[ChronicScriptMedicine]	CSM  on CMF.ChronicMedicationFormId = CSM.ChronicMedicationFormId

	where PA.PreAuthNumber =  @PreAuthNumber;

END
GO