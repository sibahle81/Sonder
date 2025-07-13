  
-- =============================================  
-- Author:  Thomas Dry  
-- Create date: 2025/07/10  
-- Description: Blank SP to get RDL populated with test values. Placeholder for the SP that will contain the report data  

-- Author:  Prateek Joshi
-- Modify date: 2025/07/11  
-- Description: Procedure to get the the Form Letter data 
-- =============================================  
CREATE PROCEDURE [medical].[getProstheticOrthoticsAuthorisationData]  
	-- Add the parameters for the stored procedure here  
	@PreAuthNumber VARCHAR(50) = NULL  
AS  
BEGIN  
  
 SET NOCOUNT ON;  
  
 SELECT   
	HP.[Name]								AS sAuthedMSPName  
	,HP.PracticeNumber						AS sAuthedMSPPracticeNo  
	,GETDATE()								AS dtGetDate  
	,(Per.FirstName + ' ' + Per.Surname) 	AS sPatientName  
	,C.ClaimReferenceNumber 				AS sMainClaimFileRef  
	,PE.EmployeeIndustryNumber				AS sIndustryNumber  
	,P.PensionClaimMapId 					AS sPensionFullReferenceNumber  
	,PA.DateAuthorisedFrom					AS dtAccidentDate  
	,Per.DateOfBirth						AS dtDateOfBirth  
	,Teb.TebaAuthID  						AS sTebaAuthNumber  
	,PA.PreAuthNumber						AS sPreAuthNumber  
	,PA.DateAuthorisedFrom 					AS dtDateAuthorised  
	,PA.ModifiedBy							AS sAuthUserName  
	,PA.DateAuthorisedFrom					AS dtEffectiveDate  
	,PA.DateAuthorisedTo					AS dtTerminationDate  
	,'p'									AS sProstheticService  
	,'q'									AS sDRGCodesPROSTETIC  
	,PAC.ICD10CodeId 						AS sPrimaryICD10Code  
	,'s'									AS sICD10CodeHSP  
	,TB.Name								AS sTreatmentBasket  
	,MI.ItemCode 							AS sItemCode  
	,MI.Description 						AS sDescription  
	,'w'									AS crAmount  
	,PAC.ICD10Code							AS sClaimICD10Code  
	FROM			medical.PreAuthorisation PA WITH(NOLOCK)
	INNER JOIN		claim.Claim C								ON PA.ClaimId = C.ClaimId  
    INNER JOIN		medical.HealthCareProvider HP				ON PA.HealthCareProviderId = HP.Roleplayerid  
	INNER JOIN		medical.TebaAuthorisation_Temp Teb			ON PA.PersonEventId = Teb.PersonEventID   
	INNER JOIN		pension.PensionClaimMap PCM					ON C.ClaimReferenceNumber = PCM.ClaimReferenceNumber  
	INNER JOIN		pension.Pensioner P							ON PCM.PensionClaimMapId = P.PensionClaimMapId  
    INNER JOIN		client.Person PER							ON P.PersonId = PER.RolePlayerId  
	INNER JOIN		medical.PreAuthICD10Code PAC				ON PAC.PreAuthId = PA.PreAuthId  
    INNER JOIN		medical.PreAuthTreatmentBasket PTB			ON PA.PreAuthId = PTB.PreAuthId  
    INNER JOIN		medical.TreatmentBasket TB					ON PTB.TreatmentBasketId = TB.TreatmentBasketId  
    INNER JOIN		client.PersonEmployment PE					ON PER.RolePlayerId = PE.EmployeeRolePlayerId  
	INNER JOIN		[medical].[PreAuthorisationBreakdown] PAB	ON PAB.PreAuthId =  PA.PreAuthId    
	INNER JOIN		medical.MedicalItem MI						ON PAB.MedicalItemId = MI.MedicalItemId   
	INNER JOIN		[medical].[TreatmentCode] T					ON PAB.TreatmentCodeId = T.TreatmentCodeId   
	INNER JOIN		[medical].[PreAuthLevelOfCare] PLC			ON PLC.PreAuthBreakdownID = PAB.PreAuthBreakdownId  
	INNER JOIN		[medical].[LevelOfCare] LC					ON LC.Id = PLC.LevelOfCareId   
	where			PA.PreAuthNumber =  @PreAuthNumber;  	
   
END  