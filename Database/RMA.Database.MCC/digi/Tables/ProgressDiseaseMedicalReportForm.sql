CREATE TABLE [digi].[ProgressDiseaseMedicalReportForm] (
    [ProgressDiseaseMedicalReportFormId] INT            IDENTITY (1, 1) NOT NULL,
    [MedicalReportFormId]                INT            NOT NULL,
    [NotStabilisedDetails]               VARCHAR (1000) NULL,
    [FurtherTreatmentDetails]            VARCHAR (1000) NULL,
    [SpecialistReferralDetails]          VARCHAR (1000) NULL,
    [PhysiotherapyTreatmentDetails]      VARCHAR (1000) NULL,
    [RangeOfMotion]                      DECIMAL (5, 2) NULL,
    CONSTRAINT [PK_digi.ProgressDiseaseMedicalReportForm] PRIMARY KEY CLUSTERED ([ProgressDiseaseMedicalReportFormId] ASC),
    CONSTRAINT [FK_ProgressDiseaseMedicalReport_MedicalReport] FOREIGN KEY ([MedicalReportFormId]) REFERENCES [digi].[MedicalReportForm] ([MedicalReportFormId])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RangeOfMotion';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RangeOfMotion';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RangeOfMotion';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RangeOfMotion';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RangeOfMotion';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RangeOfMotion';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FurtherTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FurtherTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FurtherTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FurtherTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FurtherTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FurtherTreatmentDetails';

