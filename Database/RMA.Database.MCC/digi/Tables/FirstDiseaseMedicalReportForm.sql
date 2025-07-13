CREATE TABLE [digi].[FirstDiseaseMedicalReportForm] (
    [FirstDiseaseMedicalReportFormId]   INT            IDENTITY (1, 1) NOT NULL,
    [MedicalReportFormId]               INT            NOT NULL,
    [Diagnosis]                         VARCHAR (1000) NULL,
    [DateSymptomsStarted]               DATE           NULL,
    [Symptoms]                          VARCHAR (1000) NULL,
    [FirstConsultationDate]             DATE           NULL,
    [DateDiagnosed]                     DATE           NULL,
    [ClinicalDetails]                   VARCHAR (1000) NULL,
    [SpecialistReferralDetails]         VARCHAR (250)  NULL,
    [AdditionalAnalysisDone]            VARCHAR (1000) NULL,
    [PreExistingConditions]             VARCHAR (1000) NULL,
    [DiseaseProgressionDetails]         VARCHAR (1000) NULL,
    [OthersAffected]                    BIT            CONSTRAINT [DF_digi.FirstDiseaseMedicalReportForm_OthersAffected] DEFAULT ((0)) NOT NULL,
    [PriorCareManagement]               VARCHAR (1000) NULL,
    [PriorWorkManagement]               VARCHAR (1000) NULL,
    [IsAdaptedWorkArrangementTemporary] BIT            CONSTRAINT [DF_digi.FirstDiseaseMedicalReportForm_IsAdaptedWorkArrangementTemporary] DEFAULT ((1)) NOT NULL,
    [WorkOption]                        VARCHAR (50)   NOT NULL,
    [Axis1]                             VARCHAR (1000) NULL,
    [Axis2]                             VARCHAR (1000) NULL,
    [Axis3]                             VARCHAR (1000) NULL,
    [Axis4]                             VARCHAR (1000) NULL,
    [Axis5]                             VARCHAR (1000) NULL,
    CONSTRAINT [PK_digi.FirstDiseaseMedicalReportForm] PRIMARY KEY CLUSTERED ([FirstDiseaseMedicalReportFormId] ASC),
    CONSTRAINT [FK_FirstDiseaseMedicalReportForm_MedicalReportForm] FOREIGN KEY ([MedicalReportFormId]) REFERENCES [digi].[MedicalReportForm] ([MedicalReportFormId])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'WorkOption';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'WorkOption';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'WorkOption';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'WorkOption';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'WorkOption';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'WorkOption';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Symptoms';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Symptoms';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Symptoms';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Symptoms';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Symptoms';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Symptoms';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorWorkManagement';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorWorkManagement';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorWorkManagement';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorWorkManagement';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorWorkManagement';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorWorkManagement';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorCareManagement';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorCareManagement';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorCareManagement';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorCareManagement';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorCareManagement';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PriorCareManagement';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OthersAffected';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OthersAffected';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OthersAffected';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OthersAffected';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OthersAffected';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OthersAffected';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsAdaptedWorkArrangementTemporary';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsAdaptedWorkArrangementTemporary';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsAdaptedWorkArrangementTemporary';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsAdaptedWorkArrangementTemporary';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsAdaptedWorkArrangementTemporary';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsAdaptedWorkArrangementTemporary';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstConsultationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstConsultationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstConsultationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstConsultationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstConsultationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstConsultationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DiseaseProgressionDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DiseaseProgressionDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DiseaseProgressionDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DiseaseProgressionDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DiseaseProgressionDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DiseaseProgressionDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Diagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Diagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Diagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Diagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Diagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Diagnosis';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateSymptomsStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateSymptomsStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateSymptomsStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateSymptomsStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateSymptomsStarted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateSymptomsStarted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateDiagnosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateDiagnosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateDiagnosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateDiagnosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateDiagnosed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateDiagnosed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis5';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis5';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis5';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis5';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis5';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis5';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis4';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis4';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis4';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis4';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis4';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis4';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis3';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis3';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis3';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis3';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis3';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis3';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'Axis1';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalAnalysisDone';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalAnalysisDone';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalAnalysisDone';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalAnalysisDone';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalAnalysisDone';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalAnalysisDone';

