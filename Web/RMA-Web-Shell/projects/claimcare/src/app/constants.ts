export class Constants {
    static dateString = 'yyyy-MM-dd';
    static timeString = 'hh:mm';
    static minDate = '0001-01-01T00:00:00';
    static digiCareFirstMedicalReportAccident = 'First Medical Report (Accident)';
    static digiCareProgressMedicalReportAccident = 'Progress Medical Report (Accident)';
    static digiCareFinalMedicalReportAccident = 'Final Medical Report (Accident)';

    static digiCareFirstMedicalReportDisease = 'First Medical Report (Disease)';
    static digiCareProgressMedicalReportDisease = 'Progress Medical Report (Disease)';
    static digiCareFinalMedicalReportDisease = 'Final Medical Report (Disease)';

    static digiCareFirstMedicalItemTypeAccident = 1;
    static digiCareProgressMedicalItemTypeAccident = 2;
    static digiCareFinalMedicalItemTypeAccident = 3;

    static digiCareFirstMedicalItemTypeDisease = 4;
    static digiCareProgressMedicalItemTypeDisease = 5;
    static digiCareFinalMedicalItemTypeDisease = 6;

    static digiCareFirstMedicalWizardConfigurationIdAccident = 54;
    static digiCareProgressMedicalWizardConfigurationIdAccident = 57;
    static digiCareFinalMedicalWizardConfigurationIdAccident = 58;

    static digiCareFirstMedicalWizardConfigurationIdDisease = 62;
    static digiCareProgressMedicalWizardConfigurationIdDisease = 63;
    static digiCareFinalMedicalWizardConfigurationIdDisease = 64;

    static digiCareMedicalFormAccidentWizard = 'first-medical-report-form';
    static digiCareMedicalFormDiseaseWizard = 'first-disease-medical-report-form';
    static progressMedicalReport = 'Progress Medical Report';
    static firstMedicalReport = 'First Medical Report';
    static finalMedicalReport = 'Final Medical Report';
    static externalIcd10CodeInvalid = 2;
    static time24HRString = 'HH:mm';
    static maxAge = 100;
    static minAge = 26;
    static mvaThreshold = 'MVAThreshold';
    static formatString = '/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g';


    static eventTypeId = 'eventId';
    static claimTypeId = 'claimTypeId';
    static insuranceTypeId = 'insuranceTypeId';
    static personEventBucketClassId = 'personEventBucketClassId';
    static month = 'month';
    static successful = 'Successful';
    static deceased = 'DECEASED';
    static alive = 'ALIVE';
    static notFound = 'NOT FOUND';
    static RMANoResponse = 'No Response';
    static notSuspicious = 'NotSuspicious';
    static notSuspiciousLabel = 'Not Suspicious';
    static notProcessed = 'NotProcessed';
    static notProcessedLabel = 'Not Processed';
    static claimRequirement = 'ClaimRequirement';
    static claimRequirementLabel = 'Claim Requirement';
    static checkInjury = 'CheckInjury';
    static checkInjuryLabel = 'Check Injury';
    static getPolicy = 'GetPolicy';
    static getPolicyLabel = 'Get Policy';
    static medicalReport = 'MedicalReport';
    static medicalReportLabel = 'Medical Report';
    static iCD10Modified = 'ICD10Modified';
    static iCD10ModifiedLabel = 'ICD10 Modified';
    static teamLead = 'TeamLead';
    static teamLeadClaimManager = '/Claims manager';
    static teamLeadLabel = 'Team Lead';
    static checkVOPD = 'CheckVOPD';
    static checkVOPDLabel = 'Check VOPD';
    static getVOPDResults = 'GetVopdResults';
    static getVOPDResultsLabel = 'Get VOPD Results';
    static GetClaimType = 'GetClaimType';
    static GetClaimTypeLabel = 'Get ClaimType';
    static checkReportDate = 'CheckReportDate';
    static checkReportDateLabel = 'Check Report Date';
    static vopdMismatch = 'VopdMismatch';
    static vopdMismatchLabel = 'Vopd Mismatch';
    static noVOPDResponse = 'NoVOPDResponse';
    static noVOPDResponseLabel = 'No VOPD Response';
    static vopdDeceased = 'VopdDeceased';
    static vopdDeceasedLabel = 'Vopd Deceased';
    static diagnostic = 'diagnostics';
    static diagnosticNotCapturer = 'diagnosticsNotCapturer';
    static severity = 'severity';
    static severityNotCapturer = 'severityNotCapturer';
    static insuranceType = 'insuranceType';
    static claimType = 'claimType';
    static benefits = 'benefits';
    static bodySide = 'bodySide';
    static category = 'codeCategory';
    static subCategory = 'subCategory';
    static code = 'icdCode';
    static nationality = 'nationality';
    static country = 'country';
    static province = 'province';
    static language = 'language';
    static beneficiary = 'beneficiary';
    static female = 2;
    static male = 1;

    static AgeAnalysisZeroToThirtyDays = '0 To 30 Days';
    static AgeAnalysisThirtyToSixtyDays = '30 To 60 Days';
    static AgeAnalysisOverSixtyDays = 'Over 60 Days';


    static CaptureNotificationPermission = 'Capture Notification';
    static ViewSTPPermission = 'View STP Claim';
    static CaptureICD10CodesPermission = 'Capture ICD 10 Codes';
    static prePopulateDropdown = 'All';
    static prePopulateCountry = 'South Africa';
    static prePopulateLanguage = 'English';
    static prePopulateProvince = 'Gauteng';
    static prePopulateBeneficiary = 'Spouse';
    static emptyString = '';
    static stpDropdownDefault = 3;
    static statusesDefault = -1;

    static variableEarningMonthConstant: number = 6;
    static ICD10CodeDiseaseFatalDRG: number = 2;
    static notificationOnly: number = 15;
    static saId: number = 13;
    static section51CheckAge: number = 26;

    static coidaIO: number = 10;
    static holisticViewUrl = 'claimcare/claim-manager/holistic-claim-view/';
    static NIHL = 'NIHL';
    static diseaseTypeNoise = 'Noise Induced Hearing Loss';
    static invoiceAmount = 'invoiceAmount';
    static ccaRole = 'Clinical Claims Adjudicator';
    static caRole = 'Claims Admin';
    static cadRole = 'Claims Administrator';
    static ccaTeamLeadRole = 'CCA Team Lead';
    static cmcRole = 'Claims Management Consultant';
    static scaRole = 'Senior Claims Assessor';
    static scaTeamLeadRole = 'SCA Team Lead';
    static investigationConsultantRole = 'Investigation Consultant';
    static RemoveClaimFromSTPQueue = 'Remove Claim From STP Queue';
    static claimsAssessor = 'Claims Assessor';
    static complianceConsultant = 'Compliance Consultant';
    static legalRole = 'Legal';
    static cmRole = 'Claims Manager';
    static pensionInterviewKeyName = 'requiredDocumentId';
    static Section4251QuestionaireUnder26 = 'Apprenticeship/Or Employees U26';

    static futureEarnings = 'Future earnings'
    static earningsCategoryId: number = 29;
    static futureProbableEarnings: number = 104; 
    static firstMedicalReportOutstanding: number = 126; 
    static roadAccidentQuestionnaire : number = 205; 

    static scaPool = 'Sca Pool'; 
}
