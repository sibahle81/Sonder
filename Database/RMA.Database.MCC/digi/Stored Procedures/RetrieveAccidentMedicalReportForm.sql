CREATE PROCEDURE [digi].[RetrieveAccidentMedicalReportForm]

 @MedicalReportFormId int 
AS
BEGIN
DECLARE @json NVARCHAR(MAX)
DECLARE @ICD10codesList VARCHAR(8000) 

SELECT @json= ICD10CodesJSON FROM digi.MedicalReportForm WHERE MedicalReportFormId = @MedicalReportFormId

SELECT @ICD10codesList = COALESCE(@ICD10codesList + ',', '') + icd10Level4Code + ' , - Body side affected: ' + bodySideAffected  +COALESCE( ' (' + bodySideComment + ')','') + ' , - Severity : ' + severity  
FROM  
 OPENJSON ( @json )  
WITH (   
              icd10Level4Code   varchar(200) '$.icd10Level4Code' ,  
              bodySideAffected     varchar(200)     '$.bodySideAffected',  
              severity varchar(200) '$.severity',  
              bodySideComment varchar(2000) '$.bodySideComment'
 )

IF EXISTS(SELECT 1 FROM Common.FeatureFlagSettings where [key] = 'DigiToCommonSchemaChanges' and [Value] = 'true')
BEGIN
	SELECT MedicalForm.[MedicalReportFormId]
		  ,UPPER(MedicalForm.[ClaimReferenceNumber]) ClaimReferenceNumber
		  ,CONVERT(VARCHAR, MedicalForm.[EventDate], 106) EventDate
		  ,CONVERT(VARCHAR, MedicalForm.[DateOfBirth], 106) DateOfBirth
		  ,UPPER(MedicalForm.[Name]) [Name]
		  ,UPPER(MedicalForm.[Surname]) Surname
		  ,MedicalForm.[ContactNumber]
		  ,UPPER(MedicalForm.[IndustryNumber]) IndustryNumber
		  ,UPPER(MedicalForm.[ClaimantOccupation]) ClaimantOccupation
		  ,UPPER(MedicalForm.[EmployerName]) EmployerName
		  ,CONVERT(VARCHAR,MedicalForm.[ConsultationDate], 106) ConsultationDate
		  ,UPPER(MedicalForm.[HealthcareProviderName]) HealthcareProviderName
		  ,MedicalForm.[HealthcareProviderPracticeNumber]
		  ,CONVERT(VARCHAR,MedicalForm.[ReportDate], 106) ReportDate
		  ,UPPER(MedicalForm.[ReportStatus]) ReportStatus
		  ,UPPER(MedicalForm.[Gender]) Gender
		  ,CASE WHEN @ICD10codesList IS NOT NULL 
				THEN @ICD10codesList
				ELSE
				REPLACE((SELECT DISTINCT UPPER (IcdCode.ICD10Level4Description) +','
				FROM STRING_SPLIT(MedicalForm.ICD10Codes, ',') diagnosticCodes
				INNER JOIN[digi].ICD10Code IcdCode ON IcdCode.ICD10Level4Code = TRIM(diagnosticCodes.Value) 
				WHERE IcdCode.IsDeleted = 0
				FOR XML PATH ('')
			), ',', CHAR(13) + CHAR(10)) END ICD10Codes

		  , UPPER(reportType.Name) MedicalReportTypeDescription 
		  , MedicalForm.ReportTypeId	  
		  ,CASE WHEN MedicalForm.[UnfitStartDate] IS NOT NULL THEN 'YES' ELSE 'NO' END IsUnfitForWork
		  ,CASE WHEN MedicalForm.[UnfitStartDate] IS NOT NULL THEN CONVERT(VARCHAR, MedicalForm.[UnfitStartDate], 106) ELSE 'N/A' END UnfitStartDate
		  ,CASE WHEN MedicalForm.[UnfitEndDate] IS NOT NULL THEN CONVERT(VARCHAR,MedicalForm.[UnfitEndDate], 106) ELSE 'N/A' END UnfitEndDate
		  ,CASE WHEN MedicalForm.[UnfitStartDate] IS NOT NULL THEN CONVERT(VARCHAR, DATEDIFF(dd, MedicalForm.[UnfitStartDate], MedicalForm.[UnfitEndDate]) + 1) ELSE 'N/A' END EstimatedDaysOff

		  ,FirstMedicalFormDetails.[MechanismOfInjury] MechanismOfInjuryFirstMR
		  ,FirstMedicalFormDetails.[ClinicalDescription] ClinicalDescription
		  ,CASE FirstMedicalFormDetails.[IsInjuryMechanismConsistent] WHEN  1 THEN 'YES' ELSE 'NO' END IsInjuryMechanismConsistent
		  ,CASE FirstMedicalFormDetails.[IsPreExistingConditions] WHEN 1 THEN 'YES' ELSE 'NO' END IsPreExistingConditions
		  ,CASE FirstMedicalFormDetails.[IsPreExistingConditions] WHEN 1 THEN FirstMedicalFormDetails.[PreExistingConditions] ELSE 'N/A' END PreExistingConditions
       

		  ,CASE LEN(	
					TRIM(
						COALESCE(ProgressMedicalFormDetails.[NotStabilisedReason], ''))) WHEN 0 THEN 'YES' ELSE 'NO' END IsStabilisedProgressMR
		  ,COALESCE(ProgressMedicalFormDetails.[NotStabilisedReason], 'N/A') NotStabilisedReason
		  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[TreatmentDetails], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END RequiresFurtherTreatment
		  ,COALESCE(ProgressMedicalFormDetails.[TreatmentDetails], 'N/A') TreatmentDetails
		  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[SpecialistReferralsHistory], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END ReferredToSpecialist
		  ,COALESCE(ProgressMedicalFormDetails.[SpecialistReferralsHistory], 'N/A') SpecialistReferralsHistory
		  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[RadiologyFindings], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END PerformedRadiologyTests
		  ,COALESCE(ProgressMedicalFormDetails.[RadiologyFindings], 'N/A') RadiologyFindings
		  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[OperationsProcedures], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END PerformedOperationsProcedures
		  ,COALESCE(ProgressMedicalFormDetails.[OperationsProcedures], 'N/A') OperationsProcedures
		  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[PhysiotherapyTreatmentDetails], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END FurtherPhysiotherapyTreatmentPerformed
		  ,COALESCE(ProgressMedicalFormDetails.[PhysiotherapyTreatmentDetails], 'N/A') PhysiotherapyTreatmentDetail

		  ,COALESCE(FinalMedicalFormDetails.[MechanismOfInjury], 'N/A') MechanismOfInjuryFinalMR
		  ,COALESCE(FinalMedicalFormDetails.[injuryOrDiseaseDescription], 'N/A') InjuryOrDiseaseDescription
		  ,CASE LEN(TRIM(COALESCE(FinalMedicalFormDetails.[AdditionalContributoryCauses], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END HasAdditionalContributoryCauses
		  ,COALESCE(FinalMedicalFormDetails.[AdditionalContributoryCauses], 'N/A') AdditionalContributoryCauses
		  ,CASE LEN(TRIM(COALESCE(FinalMedicalFormDetails.[ImpairmentFindings], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END HasImpairmentFindings
		  ,COALESCE(FinalMedicalFormDetails.[ImpairmentFindings], 'N/A') ImpairmentFindings
		  ,CASE FinalMedicalFormDetails.[IsStabilised] WHEN 1 THEN 'YES' ELSE 'NO' END IsStabilisedFinalMR
		  ,COALESCE(CONVERT(VARCHAR,FinalMedicalFormDetails.[DateReturnToWork], 106), 'N/A') DateReturnToWork
		  ,COALESCE(CONVERT(VARCHAR,COALESCE(FinalMedicalFormDetails.[DateStabilised], FinalMedicalFormDetails.[PEVStabilisedDate]), 106), 'N/A') DateStabilised
		  ,CASE WHEN CONVERT(VARCHAR, MedicalForm.[NextReviewDate], 106) = '01 Jan 1900' THEN 'N/A' ELSE COALESCE(CONVERT(VARCHAR,MedicalForm.[NextReviewDate], 106), 'N/A') END NextReviewDate

	FROM [digi].[MedicalReportForm] MedicalForm 
	LEFT JOIN [digi].[FirstMedicalReportForm] FirstMedicalFormDetails 
	ON MedicalForm.MedicalReportFormId = FirstMedicalFormDetails.MedicalReportFormId
	LEFT JOIN [digi].[ProgressMedicalReportForm] ProgressMedicalFormDetails 
	ON MedicalForm.MedicalReportFormId = ProgressMedicalFormDetails.MedicalReportFormId
	LEFT JOIN [digi].[FinalMedicalReportForm] FinalMedicalFormDetails 
	ON MedicalForm.MedicalReportFormId = FinalMedicalFormDetails.MedicalReportFormId
	INNER JOIN [common].[MedicalFormReportType] reportType ON reportType.Id = MedicalForm.ReportTypeId
	WHERE MedicalForm.MedicalReportFormId  = @MedicalReportFormId
END
ELSE
BEGIN
	SELECT MedicalForm.[MedicalReportFormId]
      ,UPPER(MedicalForm.[ClaimReferenceNumber]) ClaimReferenceNumber
      ,CONVERT(VARCHAR, MedicalForm.[EventDate], 106) EventDate
      ,CONVERT(VARCHAR, MedicalForm.[DateOfBirth], 106) DateOfBirth
      ,UPPER(MedicalForm.[Name]) [Name]
      ,UPPER(MedicalForm.[Surname]) Surname
      ,MedicalForm.[ContactNumber]
      ,UPPER(MedicalForm.[IndustryNumber]) IndustryNumber
      ,UPPER(MedicalForm.[ClaimantOccupation]) ClaimantOccupation
      ,UPPER(MedicalForm.[EmployerName]) EmployerName
      ,CONVERT(VARCHAR,MedicalForm.[ConsultationDate], 106) ConsultationDate
      ,UPPER(MedicalForm.[HealthcareProviderName]) HealthcareProviderName
      ,MedicalForm.[HealthcareProviderPracticeNumber]
      ,CONVERT(VARCHAR,MedicalForm.[ReportDate], 106) ReportDate
      ,UPPER(MedicalForm.[ReportStatus]) ReportStatus
      ,UPPER(MedicalForm.[Gender]) Gender
	  ,CASE WHEN @ICD10codesList IS NOT NULL 
			THEN @ICD10codesList
			ELSE
			REPLACE((SELECT DISTINCT UPPER (IcdCode.ICD10Level4Description) +','
			FROM STRING_SPLIT(MedicalForm.ICD10Codes, ',') diagnosticCodes
			INNER JOIN[digi].ICD10Code IcdCode ON IcdCode.ICD10Level4Code = TRIM(diagnosticCodes.Value) 
			WHERE IcdCode.IsDeleted = 0
			FOR XML PATH ('')
		), ',', CHAR(13) + CHAR(10)) END ICD10Codes

	  , UPPER(reportType.MedicalReportTypeDescription) MedicalReportTypeDescription 
	  , MedicalForm.ReportTypeId	  
	  ,CASE WHEN MedicalForm.[UnfitStartDate] IS NOT NULL THEN 'YES' ELSE 'NO' END IsUnfitForWork
      ,CASE WHEN MedicalForm.[UnfitStartDate] IS NOT NULL THEN CONVERT(VARCHAR, MedicalForm.[UnfitStartDate], 106) ELSE 'N/A' END UnfitStartDate
      ,CASE WHEN MedicalForm.[UnfitEndDate] IS NOT NULL THEN CONVERT(VARCHAR,MedicalForm.[UnfitEndDate], 106) ELSE 'N/A' END UnfitEndDate
	  ,CASE WHEN MedicalForm.[UnfitStartDate] IS NOT NULL THEN CONVERT(VARCHAR, DATEDIFF(dd, MedicalForm.[UnfitStartDate], MedicalForm.[UnfitEndDate]) + 1) ELSE 'N/A' END EstimatedDaysOff

      ,FirstMedicalFormDetails.[MechanismOfInjury] MechanismOfInjuryFirstMR
      ,FirstMedicalFormDetails.[ClinicalDescription] ClinicalDescription
      ,CASE FirstMedicalFormDetails.[IsInjuryMechanismConsistent] WHEN  1 THEN 'YES' ELSE 'NO' END IsInjuryMechanismConsistent
      ,CASE FirstMedicalFormDetails.[IsPreExistingConditions] WHEN 1 THEN 'YES' ELSE 'NO' END IsPreExistingConditions
      ,CASE FirstMedicalFormDetails.[IsPreExistingConditions] WHEN 1 THEN FirstMedicalFormDetails.[PreExistingConditions] ELSE 'N/A' END PreExistingConditions
       

	  ,CASE LEN(	
				TRIM(
					COALESCE(ProgressMedicalFormDetails.[NotStabilisedReason], ''))) WHEN 0 THEN 'YES' ELSE 'NO' END IsStabilisedProgressMR
	  ,COALESCE(ProgressMedicalFormDetails.[NotStabilisedReason], 'N/A') NotStabilisedReason
	  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[TreatmentDetails], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END RequiresFurtherTreatment
      ,COALESCE(ProgressMedicalFormDetails.[TreatmentDetails], 'N/A') TreatmentDetails
	  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[SpecialistReferralsHistory], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END ReferredToSpecialist
      ,COALESCE(ProgressMedicalFormDetails.[SpecialistReferralsHistory], 'N/A') SpecialistReferralsHistory
	  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[RadiologyFindings], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END PerformedRadiologyTests
	  ,COALESCE(ProgressMedicalFormDetails.[RadiologyFindings], 'N/A') RadiologyFindings
	  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[OperationsProcedures], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END PerformedOperationsProcedures
	  ,COALESCE(ProgressMedicalFormDetails.[OperationsProcedures], 'N/A') OperationsProcedures
	  ,CASE LEN(TRIM(COALESCE(ProgressMedicalFormDetails.[PhysiotherapyTreatmentDetails], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END FurtherPhysiotherapyTreatmentPerformed
	  ,COALESCE(ProgressMedicalFormDetails.[PhysiotherapyTreatmentDetails], 'N/A') PhysiotherapyTreatmentDetail

	  ,COALESCE(FinalMedicalFormDetails.[MechanismOfInjury], 'N/A') MechanismOfInjuryFinalMR
      ,COALESCE(FinalMedicalFormDetails.[injuryOrDiseaseDescription], 'N/A') InjuryOrDiseaseDescription
	  ,CASE LEN(TRIM(COALESCE(FinalMedicalFormDetails.[AdditionalContributoryCauses], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END HasAdditionalContributoryCauses
	  ,COALESCE(FinalMedicalFormDetails.[AdditionalContributoryCauses], 'N/A') AdditionalContributoryCauses
	  ,CASE LEN(TRIM(COALESCE(FinalMedicalFormDetails.[ImpairmentFindings], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END HasImpairmentFindings
      ,COALESCE(FinalMedicalFormDetails.[ImpairmentFindings], 'N/A') ImpairmentFindings
      ,CASE FinalMedicalFormDetails.[IsStabilised] WHEN 1 THEN 'YES' ELSE 'NO' END IsStabilisedFinalMR
      ,COALESCE(CONVERT(VARCHAR,FinalMedicalFormDetails.[DateReturnToWork], 106), 'N/A') DateReturnToWork
      ,COALESCE(CONVERT(VARCHAR,COALESCE(FinalMedicalFormDetails.[DateStabilised], FinalMedicalFormDetails.[PEVStabilisedDate]), 106), 'N/A') DateStabilised
	  ,CASE WHEN CONVERT(VARCHAR, MedicalForm.[NextReviewDate], 106) = '01 Jan 1900' THEN 'N/A' ELSE COALESCE(CONVERT(VARCHAR,MedicalForm.[NextReviewDate], 106), 'N/A') END NextReviewDate

	FROM [digi].[MedicalReportForm] MedicalForm 
	LEFT JOIN [digi].[FirstMedicalReportForm] FirstMedicalFormDetails 
	ON MedicalForm.MedicalReportFormId = FirstMedicalFormDetails.MedicalReportFormId
	LEFT JOIN [digi].[ProgressMedicalReportForm] ProgressMedicalFormDetails 
	ON MedicalForm.MedicalReportFormId = ProgressMedicalFormDetails.MedicalReportFormId
	LEFT JOIN [digi].[FinalMedicalReportForm] FinalMedicalFormDetails 
	ON MedicalForm.MedicalReportFormId = FinalMedicalFormDetails.MedicalReportFormId
	INNER JOIN [digi].MedicalReportType reportType ON reportType.MedicalReportTypeId = MedicalForm.ReportTypeId
	WHERE MedicalForm.MedicalReportFormId  = @MedicalReportFormId
END

END
GO


