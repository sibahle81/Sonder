
CREATE   PROCEDURE [medical].[USP_GetHealthCareProviderByIdForSTPIntegration]
	@HealthCareProviderId int
AS
BEGIN

SELECT 
 hcp.MedicalServiceProviderID AS RolePlayerId,
 hcp.Name AS Name,
 hcp.Description AS Description,
 hcp.PracticeNo AS PracticeNumber,
 hcp.DatePracticeStarted AS DatePracticeStarted,
 hcp.DatePracticeClosed AS DatePracticeClosed,
 hcp.PractitionerTypeID AS ProviderTypeId,
 pt.Name AS PractitionerTypeName,
 CAST(IIF(hcp.IsVat = 0, 0, 1) AS BIT) AS IsVat,
 hcp.VATRegNumber AS VatRegNumber,
 hcp.ConsultingPartnerType AS ConsultingPartnerType,
 CAST(IIF(hcp.IsPreferred = 0, 0, 1) AS BIT) AS IsPreferred,
 CAST(IIF(hcp.IsMedInvTreatmentInfoProvided = 0, 0, 1) AS BIT) AS IsMedInvTreatmentInfoProvided,
 CAST(IIF(hcp.IsMedInvInjuryInfoProvided = 0, 0, 1) AS BIT) AS IsMedInvInjuryInfoProvided,
 CAST(IIF(hcp.IsMineHospital > 0, 1, 0) AS BIT) AS IsMineHospital,
 CAST(IIF(hcp.IsNeedTreatments = 0, 0, 1) AS BIT) AS IsNeedTreatments,
 hcp.ArmType AS ArmType,
 hcp.ArmCode AS ArmCode,
 hcp.FinSystemSynchStatusID AS FinSystemSynchStatusId,
 hcp.MSPGroupID AS HealthCareProviderGroupId,
 hcp.DispensingLicenseNo AS DispensingLicenseNo,
 hcp.AcuteMedicalAuthNeededTypeID AS AcuteMedicalAuthNeededTypeId,
 hcp.ChronicMedicalAuthNeededTypeID AS ChronicMedicalAuthNeededTypeId,
 CAST(IIF(hcp.IsAllowSameDayTreatment = 0, 0, 1) AS BIT) AS IsAllowSameDayTreatment,
 hcp.AgreementEndDate AS AgreementEndDate,
 hcp.AgreementStartDate AS AgreementStartDate,
 	CASE
		WHEN hcp.IsAuthorised = 0  then CAST(0 AS BIT)
		WHEN hcp.IsAuthorised = 1  then CAST(1 AS BIT)
		ELSE CAST(0 AS BIT)
	END AS IsAuthorised,
 hcp.AgreementType AS AgreementType,
 CAST(IIF(hcp.IsActive = 0, 0, 1) AS BIT) AS IsActive,
 CAST(0 AS BIT) AS IsDeleted,
 CAST(0 AS BIT) AS IsExcludeAutoPay
FROM [medical].[CompcareMSP] AS hcp
INNER JOIN [medical].[CompcarePractitionerType] AS pt
ON pt.PractitionerTypeID = hcp.PractitionerTypeID
WHERE hcp.MedicalServiceProviderID = @HealthCareProviderId

END