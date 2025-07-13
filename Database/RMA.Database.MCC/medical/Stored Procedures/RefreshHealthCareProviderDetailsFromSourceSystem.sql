CREATE PROCEDURE [medical].[RefreshHealthCareProviderDetailsFromSourceSystem]
 AS
  BEGIN

	DROP TABLE IF EXISTS tempdb.medical.#tempHCP;

	SELECT  
	   [MedicalServiceProviderID]
	  ,[Name]
      ,[Description]
      ,PracticeNo [PracticeNumber]
      ,[DatePracticeStarted]
      ,[DatePracticeClosed]
      ,PractitionerTypeID [ProviderTypeId]
      ,[IsVat]
      ,[VATRegNumber]
      ,[ConsultingPartnerType]
      ,[IsPreferred]
      ,[IsMedInvTreatmentInfoProvided]
      ,[IsMedInvInjuryInfoProvided]
      ,[IsMineHospital]
      ,[IsNeedTreatments]
      ,[ArmType]
      ,[ArmCode]
      ,[FinSystemSynchStatusId]
      ,MSPGroupID [HealthCareProviderGroupId]
      ,[DispensingLicenseNo]
      ,[AcuteMedicalAuthNeededTypeId]
      ,[ChronicMedicalAuthNeededTypeId]
      ,[IsAllowSameDayTreatment]
      ,[AgreementEndDate]
      ,[AgreementStartDate]
      ,[IsAuthorised]
      ,[AgreementType] 
      ,CASE IsActive WHEN 1 then 0 ELSE 1 END IsDeleted
      ,GETDATE() [CreatedDate]
	  ,'SQLJOB' [CreatedBy]
	  ,GETDATE() ModifiedDate
	  ,'SQLJOB' [ModifiedBy]
      ,UPPER(master.dbo.fn_varbintohexstr(HASHBYTES ('SHA2_256', CONCAT([MedicalServiceProviderID], '|',
		  [Name], '|',
		  [Description], '|',
		  PracticeNo , '|',
		  CONVERT(VARCHAR, [DatePracticeStarted], 111) , '|',
		  CONVERT(VARCHAR,[DatePracticeClosed], 111), '|',
		  PractitionerTypeID, '|',
		  [IsVat], '|',
		  [VATRegNumber], '|',
		  [ConsultingPartnerType], '|',
		  [IsPreferred], '|',
		  [IsMedInvTreatmentInfoProvided], '|',
		  [IsMedInvInjuryInfoProvided], '|',
		  [IsMineHospital], '|',
		  [IsNeedTreatments], '|',
		  [ArmType], '|',
		  [ArmCode], '|',
		  [FinSystemSynchStatusId], '|',
		  MSPGroupID , '|',
		  [DispensingLicenseNo], '|',
		  [AcuteMedicalAuthNeededTypeId], '|',
		  [ChronicMedicalAuthNeededTypeId], '|',
		  [IsAllowSameDayTreatment], '|',
		  CONVERT(VARCHAR,[AgreementEndDate]), '|',
		  CONVERT(VARCHAR,[AgreementStartDate]), '|',
		  [IsAuthorised], '|',
		  [AgreementType], '|',
		  IIF( IsActive = 1 , 0, 1)
		  )))) [Hash]
	into medical.#tempHCP
	FROM [medical].[CompcareMSP]
	ORDER BY [MedicalServiceProviderID]	

	MERGE[medical].[HealthCareProvider] hcp
	USING medical.#tempHCP tmpHCP ON hcp.[PracticeNumber]= tmpHCP.[PracticeNumber]
	WHEN NOT MATCHED BY TARGET 
	THEN 
	INSERT ([Name]
      ,[Description]
      ,[PracticeNumber]
      ,[DatePracticeStarted]
      ,[DatePracticeClosed]
      ,[ProviderTypeId]
      ,[IsVat]
      ,[VATRegNumber]
      ,[ConsultingPartnerType]
      ,[IsPreferred]
      ,[IsMedInvTreatmentInfoProvided]
      ,[IsMedInvInjuryInfoProvided]
      ,[IsMineHospital]
      ,[IsNeedTreatments]
      ,[ArmType]
      ,[ArmCode]
      ,[FinSystemSynchStatusId]
      ,[HealthCareProviderGroupId]
      ,[DispensingLicenseNo]
      ,[AcuteMedicalAuthNeededTypeId]
      ,[ChronicMedicalAuthNeededTypeId]
      ,[IsAllowSameDayTreatment]
      ,[AgreementEndDate]
      ,[AgreementStartDate]
      ,[IsAuthorised]
      ,[AgreementType]
      ,[IsActive]
      ,[IsDeleted]
      ,[CreatedBy]
      ,[CreatedDate]
      ,[ModifiedBy]
      ,[ModifiedDate]
      ,[Hash])
	  VALUES
	  ([Name]
      ,[Description]
      ,[PracticeNumber]
      ,[DatePracticeStarted]
      ,[DatePracticeClosed]
      ,[ProviderTypeId]
      ,[IsVat]
      ,[VATRegNumber]
      ,[ConsultingPartnerType]
      ,[IsPreferred]
      ,[IsMedInvTreatmentInfoProvided]
      ,[IsMedInvInjuryInfoProvided]
      ,[IsMineHospital]
      ,[IsNeedTreatments]
      ,[ArmType]
      ,[ArmCode]
      ,[FinSystemSynchStatusId]
      ,[HealthCareProviderGroupId]
      ,[DispensingLicenseNo]
      ,[AcuteMedicalAuthNeededTypeId]
      ,[ChronicMedicalAuthNeededTypeId]
      ,[IsAllowSameDayTreatment]
      ,[AgreementEndDate]
      ,[AgreementStartDate]
      ,[IsAuthorised]
      ,[AgreementType]
      ,[TenantId]
      ,IIF([IsDeleted] = 0, 1, 0)
      ,[IsDeleted]
      ,[CreatedBy]
      ,[CreatedDate]
      ,[ModifiedBy]
      ,[ModifiedDate]
      ,[Hash])
	WHEN MATCHED AND (tmpHCP.[Hash] != hcp.[Hash]) THEN
	UPDATE SET [Name] = tmpHCP.[Name]
      ,[Description] = tmpHCP.[Description]
      ,[DatePracticeStarted] = tmpHCP.[DatePracticeStarted]
      ,[DatePracticeClosed] = tmpHCP.[DatePracticeClosed]
      ,[ProviderTypeId] = tmpHCP.[ProviderTypeId] 
      ,[IsVat] = tmpHCP.[IsVat]
      ,[VATRegNumber] = tmpHCP.[VATRegNumber]
      ,[ConsultingPartnerType] = tmpHCP.[ConsultingPartnerType]
      ,[IsPreferred] = tmpHCP.[IsPreferred]
      ,[IsMedInvTreatmentInfoProvided] = tmpHCP.[IsMedInvTreatmentInfoProvided]
      ,[IsMedInvInjuryInfoProvided] = tmpHCP.[IsMedInvInjuryInfoProvided]
      ,[IsMineHospital] = tmpHCP.[IsMineHospital]
      ,[IsNeedTreatments] = tmpHCP.[IsNeedTreatments]
      ,[ArmType] = tmpHCP.[ArmType]
      ,[ArmCode] = tmpHCP.[ArmCode]
      ,[FinSystemSynchStatusId] = tmpHCP.[FinSystemSynchStatusId]
      ,[HealthCareProviderGroupId] = tmpHCP.[HealthCareProviderGroupId]
      ,[DispensingLicenseNo] = tmpHCP.[DispensingLicenseNo]
      ,[AcuteMedicalAuthNeededTypeId] = tmpHCP.[AcuteMedicalAuthNeededTypeId]
      ,[ChronicMedicalAuthNeededTypeId] = tmpHCP.[ChronicMedicalAuthNeededTypeId]
      ,[IsAllowSameDayTreatment] = tmpHCP.[IsAllowSameDayTreatment]
      ,[AgreementEndDate] = tmpHCP.[AgreementEndDate]
      ,[AgreementStartDate] = tmpHCP.[AgreementStartDate]
      ,[IsAuthorised] = tmpHCP.[IsAuthorised]
      ,[AgreementType] = tmpHCP.[AgreementType]
      ,[IsDeleted]= tmpHCP.[IsDeleted]
      ,[ModifiedBy]= tmpHCP.[ModifiedBy]
      ,[ModifiedDate]= tmpHCP.[ModifiedDate]
      ,[Hash]  = tmpHCP.[Hash] ;


	DROP TABLE IF EXISTS tempdb.medical.#tempHCPMap;
	SELECT  
		hcp.[HealthCareProviderId],
		tempHCP.[MedicalServiceProviderID],	
		hcp.isDeleted,
		GETDATE() [CreatedDate],
		'SQLJOB' [CreatedBy],
		GETDATE() ModifiedDate,
		'SQLJOB' [ModifiedBy]    
	into mapping.#tempHCPMap
	FROM [medical].[HealthCareProvider] hcp LEFT OUTER JOIN  medical.#tempHCP tempHCP on hcp.PracticeNumber = tempHCP.PracticeNumber

	MERGE[mapping].[HealthCareProviderCompCareMap] hcpMap
	USING mapping.#tempHCPMap tmpHCP ON hcpMap.[HealthCareProviderId]= tmpHCP.[HealthCareProviderId]
	WHEN NOT MATCHED BY TARGET 
	THEN 
	INSERT ([HealthCareProviderId],
	[CompCareMSPId],
	[IsDeleted],
	[CreatedBy],
	[CreatedDate],
	[ModifiedBy],
	[ModifiedDate])
	  VALUES
	([HealthCareProviderId],
	[MedicalServiceProviderID],
	[IsDeleted],
	[CreatedBy],
	[CreatedDate],
	[ModifiedBy],
	[ModifiedDate]);

  END


 