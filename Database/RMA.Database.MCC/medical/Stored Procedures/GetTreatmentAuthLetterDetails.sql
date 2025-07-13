-- =============================================
-- Author:      Surya Ratheesh
-- Date:        23/06/2025
-- Description: Get TreatmentAuth Letter Details 
-- =============================================
--exec medical.GetTreatmentAuthLetterDetails 'PAC0000156'
CREATE PROCEDURE medical.GetTreatmentAuthLetterDetails
    @PreAuthNumber VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    ------------------------------------------------------
    --  Pre-Auth Header Details
    ------------------------------------------------------
    SELECT DISTINCT
        HP.Name                             AS sAuthedMSPName, 
        HP.PracticeNumber                   AS sAuthedMSPPracticeNo,
       (P.FirstName + ' ' + P.Surname)      AS sPatientName, 
        C.ClaimReferenceNumber              AS sMainClaimFileRef,
        PEM.EmployeeIndustryNumber          AS sIndustryNumber, 
        PC.PensionCaseNumber                AS sPensionFullReferenceNumber,
        PA.InjuryDate                       AS dtAccidentDate, 
        P.DateOfBirth                       AS dtDateOfBirth, 
        Teb.TebaAuthID                      AS sTebaAuthNumber, 
        PA.PreAuthNumber                    AS sPreAuthNumber, 
        PA.DateAuthorised                   AS dtDateAuthorised, 
        CAST(GETDATE() AS DATE)             AS dtDocDate,
        PA.CreatedBy                        AS sAuthUserName,
        PLC.DateTimeAdmitted                AS dtEffectiveDate,
        PLC.DateTimeDischarged              AS dtTerminationDate,
        PAC.ICD10Code                       AS sClaimICD10Code,
        PAC.ICD10CodeId                     AS sPrimaryICD10Code,
        TB.Name                             AS sTreatmentBasket,
        T.Code                              AS sAuthTreatmentCode

    FROM medical.PreAuthorisation PA    WITH (NOLOCK)
    INNER JOIN claim.Claim C                           ON PA.ClaimId = C.ClaimId
    INNER JOIN medical.HealthCareProvider HP           ON PA.HealthCareProviderId = HP.Roleplayerid
    INNER JOIN medical.PreAuthorisationBreakdown PB    ON PA.PreAuthId = PB.PreAuthId
	INNER JOIN medical.PreAuthICD10Code PAC            ON PA.PreAuthId = PAC.PreAuthId
	INNER JOIN [medical].[TreatmentBasketInjury] TBI   ON PAC.ICD10CodeId = TBI.ICD10CodeId
    INNER JOIN medical.TreatmentBasket TB              ON TBI.TreatmentBasketId = TB.TreatmentBasketId
	INNER JOIN [claim].[PersonEvent] PE                ON PA.PersonEventID = PE.PersonEventID
	INNER JOIN client.Person P                         ON PE.InsuredLifeId = P.Roleplayerid	
	INNER JOIN client.PersonEmployment PEM               ON P.RolePlayerId = PEM.EmployeeRolePlayerId 
	LEFT JOIN medical.TreatmentCode T                  ON PB.TreatmentCodeId = T.TreatmentCodeId
    LEFT JOIN medical.PreAuthLevelOfCare PLC           ON PB.PreAuthBreakdownId = PLC.PreAuthBreakdownId
	LEFT JOIN pension.PensionClaimMap PCM              ON C.ClaimReferenceNumber = PCM.ClaimReferenceNumber	
	LEFT JOIN pension.PensionCase PC                   ON PCM.PensionCaseId = PC.PensionCaseId
	LEFT JOIN medical.TebaAuthorisation_Temp Teb       ON PA.PersonEventId = Teb.PersonEventID
    WHERE PA.PreAuthNumber = @PreAuthNumber;
END
GO
