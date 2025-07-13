CREATE TABLE [digi].[FinalMedicalReportForm] (
    [FinalMedicalReportFormId]     INT             IDENTITY (1, 1) NOT NULL,
    [MedicalReportFormId]          INT             NOT NULL,
    [MechanismOfInjury]            NVARCHAR (1000) NOT NULL,
    [injuryOrDiseaseDescription]   NVARCHAR (1000) NOT NULL,
    [AdditionalContributoryCauses] NVARCHAR (1000) NULL,
    [ImpairmentFindings]           NVARCHAR (1000) NULL,
    [IsStabilised]                 BIT             NULL,
    [DateReturnToWork]             DATETIME        NULL,
    [DateStabilised]               DATETIME        NULL,
    [PEVStabilisedDate]            DATETIME        NULL,
    CONSTRAINT [PK_FinalMedicalReportForm] PRIMARY KEY CLUSTERED ([FinalMedicalReportFormId] ASC),
    CONSTRAINT [FK_FinalMedicalReportForm_MedicalReport] FOREIGN KEY ([MedicalReportFormId]) REFERENCES [digi].[MedicalReportForm] ([MedicalReportFormId])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PEVStabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PEVStabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PEVStabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PEVStabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PEVStabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PEVStabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'injuryOrDiseaseDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'injuryOrDiseaseDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'injuryOrDiseaseDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'injuryOrDiseaseDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'injuryOrDiseaseDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'injuryOrDiseaseDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ImpairmentFindings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ImpairmentFindings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ImpairmentFindings';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ImpairmentFindings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ImpairmentFindings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ImpairmentFindings';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateStabilised';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalContributoryCauses';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalContributoryCauses';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalContributoryCauses';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalContributoryCauses';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalContributoryCauses';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalMedicalReportForm', @level2type = N'COLUMN', @level2name = N'AdditionalContributoryCauses';

