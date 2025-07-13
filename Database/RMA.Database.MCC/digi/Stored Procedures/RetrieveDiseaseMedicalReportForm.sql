CREATE PROCEDURE [digi].[RetrieveDiseaseMedicalReportForm]
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
              icd10Level4Code   VARCHAR(200) '$.icd10Level4Code' ,  
              bodySideAffected     VARCHAR(200)     '$.bodySideAffected',  
              severity VARCHAR(200) '$.severity',  
              bodySideComment VARCHAR(2000) '$.bodySideComment'
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
		  ,CASE WHEN MedicalForm.[UnfitStartDate] IS NOT NULL THEN CONVERT(VARCHAR, DATEDIFF(dd, MedicalForm.[UnfitStartDate], MedicalForm.[UnfitEndDate]) + 1 ) ELSE 'N/A' END EstimatedDaysOff
		  ,CASE WHEN CONVERT(VARCHAR, MedicalForm.[NextReviewDate], 106) = '01 Jan 1900' THEN 'N/A' ELSE COALESCE(CONVERT(VARCHAR,MedicalForm.[NextReviewDate], 106), 'N/A') END NextReviewDate
		  /*First Disease Medical Report*/
		 , ISNULL(FORMAT(FirstDiseaseFormDetails.[DateSymptomsStarted], 'dd MMMM yyyy'), 'N/A') dateSymtomsStarted
		 , ISNULL(FORMAT(FirstDiseaseFormDetails.[FirstConsultationDate], 'dd MMMM yyyy'), 'N/A') firstConsultationDate
		 , ISNULL(FirstDiseaseFormDetails.[Diagnosis], 'N/A') diagnosis
		 , ISNULL(FORMAT(FirstDiseaseFormDetails.[DateDiagnosed], 'dd MMMM yyyy'), 'N/A') dateDiagnosed 
		 , ISNULL(FirstDiseaseFormDetails.[Symptoms], 'N/A') symptoms
		 , ISNULL(FirstDiseaseFormDetails.[ClinicalDetails], 'N/A') clinicalDetails
		 , CASE LEN(TRIM(COALESCE(FirstDiseaseFormDetails.[SpecialistReferralDetails]	, ''))) WHEN 0 THEN 'NO' ELSE 'YES' END isSpecialistReferralDetails
		 , ISNULL(FirstDiseaseFormDetails.[SpecialistReferralDetails], 'N/A') specialistReferralDetails
		 , ISNULL(FirstDiseaseFormDetails.[PreExistingConditions], 'N/A') preExistingConditions
		 , ISNULL(FirstDiseaseFormDetails.[DiseaseProgressionDetails], 'N/A') diseaseProgressionDetails
		 , CASE (FirstDiseaseFormDetails.[OthersAffected]) WHEN 1 THEN 'YES' ELSE 'NO' END othersAffected
		 , CASE LEN(TRIM(COALESCE(FirstDiseaseFormDetails.[AdditionalAnalysisDone], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END isAdditionalAnalysisDone
		 , additionalAnalysisDone
		 , ISNULL(FirstDiseaseFormDetails.[PriorCareManagement], 'N/A') priorCareManagement
		 , ISNULL(FirstDiseaseFormDetails.[PriorWorkManagement], 'N/A') priorWorkManagement
		 , ISNULL(FirstDiseaseFormDetails.[WorkOption], 'N/A') workOption
		 , CASE (FirstDiseaseFormDetails.[IsAdaptedWorkArrangementTemporary]) WHEN 1 THEN 'Temporary' ELSE 'Permanent' END isAdaptedWorkArrangementTemporary
		 , ISNULL(FirstDiseaseFormDetails.[Axis1], 'N/A') Axis1
		 , ISNULL(FirstDiseaseFormDetails.[Axis2], 'N/A') Axis2
		 , ISNULL(FirstDiseaseFormDetails.[Axis3], 'N/A') Axis3
		 , ISNULL(FirstDiseaseFormDetails.[Axis4], 'N/A') Axis4
		 , ISNULL(FirstDiseaseFormDetails.[Axis5], 'N/A') Axis5

		 /*Progress Disease Medical Report*/
		 , ISNULL(ProgressDiseaseFormDetails.[NotStabilisedDetails], 'N/A') NotStabilizedDetails
		 , ISNULL(ProgressDiseaseFormDetails.[FurtherTreatmentDetails], 'N/A') FurtherTreatmentDetails
		 , ISNULL(ProgressDiseaseFormDetails.[PhysiotherapyTreatmentDetails], 'N/A') PhysiotherapyTreatmentDetails
		  , ISNULL(ProgressDiseaseFormDetails.[RangeOfMotion], 0) RangeOfMotion 

		  /*Final Disease Medical Report*/
		   , ISNULL(FORMAT(FinalDiseaseFormDetails.[DateReturnToWork], 'dd MMMM yyyy'), 'N/A') DateReturnToWork
		  , ISNULL(FORMAT(FinalDiseaseFormDetails.[StabilisedDate], 'dd MMMM yyyy'), 'N/A') StabilisedDate
		  , ISNULL(FinalDiseaseFormDetails.[OccupationChangeDetails], 'N/A') OccupationChangeDetails
		  , ISNULL(FinalDiseaseFormDetails.[PermanentFunctionalLoss], 'N/A') PermanentFunctionalLoss
		  , ISNULL(FinalDiseaseFormDetails.[ConditionStabilisedDetails], 'N/A') ConditionStabilisedDetails

	FROM [digi].[MedicalReportForm] MedicalForm 
	LEFT JOIN [digi].[FirstDiseaseMedicalReportForm] FirstDiseaseFormDetails 
	ON MedicalForm.MedicalReportFormId = FirstDiseaseFormDetails.MedicalReportFormId
	LEFT JOIN [digi].[ProgressDiseaseMedicalReportForm] ProgressDiseaseFormDetails 
	ON MedicalForm.MedicalReportFormId = ProgressDiseaseFormDetails.MedicalReportFormId
	LEFT JOIN [digi].[FinalDiseaseMedicalReportForm] FinalDiseaseFormDetails 
	ON MedicalForm.MedicalReportFormId = FinalDiseaseFormDetails.MedicalReportFormId
	INNER JOIN [common].[MedicalFormReportType] reportType ON reportType.Id = MedicalForm.ReportTypeId
	WHERE MedicalForm.MedicalReportFormId = @MedicalReportFormId
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
	  ,CASE WHEN MedicalForm.[UnfitStartDate] IS NOT NULL THEN CONVERT(VARCHAR, DATEDIFF(dd, MedicalForm.[UnfitStartDate], MedicalForm.[UnfitEndDate]) + 1 ) ELSE 'N/A' END EstimatedDaysOff
	  ,CASE WHEN CONVERT(VARCHAR, MedicalForm.[NextReviewDate], 106) = '01 Jan 1900' THEN 'N/A' ELSE COALESCE(CONVERT(VARCHAR,MedicalForm.[NextReviewDate], 106), 'N/A') END NextReviewDate
	  /*First Disease Medical Report*/
     , ISNULL(FORMAT(FirstDiseaseFormDetails.[DateSymptomsStarted], 'dd MMMM yyyy'), 'N/A') dateSymtomsStarted
	 , ISNULL(FORMAT(FirstDiseaseFormDetails.[FirstConsultationDate], 'dd MMMM yyyy'), 'N/A') firstConsultationDate
	 , ISNULL(FirstDiseaseFormDetails.[Diagnosis], 'N/A') diagnosis
	 , ISNULL(FORMAT(FirstDiseaseFormDetails.[DateDiagnosed], 'dd MMMM yyyy'), 'N/A') dateDiagnosed 
	 , ISNULL(FirstDiseaseFormDetails.[Symptoms], 'N/A') symptoms
	 , ISNULL(FirstDiseaseFormDetails.[ClinicalDetails], 'N/A') clinicalDetails
	 , CASE LEN(TRIM(COALESCE(FirstDiseaseFormDetails.[SpecialistReferralDetails]	, ''))) WHEN 0 THEN 'NO' ELSE 'YES' END isSpecialistReferralDetails
	 , ISNULL(FirstDiseaseFormDetails.[SpecialistReferralDetails], 'N/A') specialistReferralDetails
	 , ISNULL(FirstDiseaseFormDetails.[PreExistingConditions], 'N/A') preExistingConditions
	 , ISNULL(FirstDiseaseFormDetails.[DiseaseProgressionDetails], 'N/A') diseaseProgressionDetails
	 , CASE (FirstDiseaseFormDetails.[OthersAffected]) WHEN 1 THEN 'YES' ELSE 'NO' END othersAffected
	 , CASE LEN(TRIM(COALESCE(FirstDiseaseFormDetails.[AdditionalAnalysisDone], ''))) WHEN 0 THEN 'NO' ELSE 'YES' END isAdditionalAnalysisDone
	 , additionalAnalysisDone
	 , ISNULL(FirstDiseaseFormDetails.[PriorCareManagement], 'N/A') priorCareManagement
	 , ISNULL(FirstDiseaseFormDetails.[PriorWorkManagement], 'N/A') priorWorkManagement
	 , ISNULL(FirstDiseaseFormDetails.[WorkOption], 'N/A') workOption
	 , CASE (FirstDiseaseFormDetails.[IsAdaptedWorkArrangementTemporary]) WHEN 1 THEN 'Temporary' ELSE 'Permanent' END isAdaptedWorkArrangementTemporary
	 , ISNULL(FirstDiseaseFormDetails.[Axis1], 'N/A') Axis1
	 , ISNULL(FirstDiseaseFormDetails.[Axis2], 'N/A') Axis2
	 , ISNULL(FirstDiseaseFormDetails.[Axis3], 'N/A') Axis3
	 , ISNULL(FirstDiseaseFormDetails.[Axis4], 'N/A') Axis4
	 , ISNULL(FirstDiseaseFormDetails.[Axis5], 'N/A') Axis5

	 /*Progress Disease Medical Report*/
	 , ISNULL(ProgressDiseaseFormDetails.[NotStabilisedDetails], 'N/A') NotStabilizedDetails
	 , ISNULL(ProgressDiseaseFormDetails.[FurtherTreatmentDetails], 'N/A') FurtherTreatmentDetails
	 , ISNULL(ProgressDiseaseFormDetails.[PhysiotherapyTreatmentDetails], 'N/A') PhysiotherapyTreatmentDetails
	  , ISNULL(ProgressDiseaseFormDetails.[RangeOfMotion], 0) RangeOfMotion 

	  /*Final Disease Medical Report*/
	   , ISNULL(FORMAT(FinalDiseaseFormDetails.[DateReturnToWork], 'dd MMMM yyyy'), 'N/A') DateReturnToWork
	  , ISNULL(FORMAT(FinalDiseaseFormDetails.[StabilisedDate], 'dd MMMM yyyy'), 'N/A') StabilisedDate
	  , ISNULL(FinalDiseaseFormDetails.[OccupationChangeDetails], 'N/A') OccupationChangeDetails
	  , ISNULL(FinalDiseaseFormDetails.[PermanentFunctionalLoss], 'N/A') PermanentFunctionalLoss
	  , ISNULL(FinalDiseaseFormDetails.[ConditionStabilisedDetails], 'N/A') ConditionStabilisedDetails

	FROM [digi].[MedicalReportForm] MedicalForm 
	LEFT JOIN [digi].[FirstDiseaseMedicalReportForm] FirstDiseaseFormDetails 
	ON MedicalForm.MedicalReportFormId = FirstDiseaseFormDetails.MedicalReportFormId
	LEFT JOIN [digi].[ProgressDiseaseMedicalReportForm] ProgressDiseaseFormDetails 
	ON MedicalForm.MedicalReportFormId = ProgressDiseaseFormDetails.MedicalReportFormId
	LEFT JOIN [digi].[FinalDiseaseMedicalReportForm] FinalDiseaseFormDetails 
	ON MedicalForm.MedicalReportFormId = FinalDiseaseFormDetails.MedicalReportFormId
	INNER JOIN [digi].MedicalReportType reportType ON reportType.MedicalReportTypeId = MedicalForm.ReportTypeId
	WHERE MedicalForm.MedicalReportFormId = @MedicalReportFormId

END

END

GO


