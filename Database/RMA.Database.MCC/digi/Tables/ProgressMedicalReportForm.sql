CREATE TABLE [digi].[ProgressMedicalReportForm] (
    [ProgressMedicalReportFormId]            INT             IDENTITY (1, 1) NOT NULL,
    [MedicalReportFormId]                    INT             NOT NULL,
    [NotStabilisedReason]                    NVARCHAR (1000) NULL,
    [TreatmentDetails]                       NVARCHAR (1000) NULL,
    [SpecialistReferralsHistory]             NVARCHAR (1000) NULL,
    [RadiologyFindings]                      NVARCHAR (1000) NULL,
    [OperationsProcedures]                   NVARCHAR (1000) NULL,
    [PhysiotherapyTreatmentDetails]          NVARCHAR (1000) NULL,
    [DateStabilised]                         DATETIME        NULL,
    [IsStabilisedChecked]                    BIT             DEFAULT ((0)) NULL,
    [IsTreatmentChecked]                     BIT             DEFAULT ((0)) NULL,
    [IsSpecialistReferralsHistoryChecked]    BIT             DEFAULT ((0)) NULL,
    [IsOperationsProceduresChecked]          BIT             DEFAULT ((0)) NULL,
    [IsPhysiotherapyTreatmentDetailsChecked] BIT             DEFAULT ((0)) NULL,
    [IsRadiologyFindingsChecked]             BIT             DEFAULT ((0)) NULL,
    CONSTRAINT [PK_ProgressMedicalReport] PRIMARY KEY CLUSTERED ([ProgressMedicalReportFormId] ASC),
    CONSTRAINT [FK_ProgressMedicalReport_MedicalReport] FOREIGN KEY ([MedicalReportFormId]) REFERENCES [digi].[MedicalReportForm] ([MedicalReportFormId])
);






GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'TreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'TreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'TreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'TreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'TreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'TreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralsHistory';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralsHistory';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralsHistory';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralsHistory';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralsHistory';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'SpecialistReferralsHistory';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RadiologyFindings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RadiologyFindings';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RadiologyFindings';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RadiologyFindings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RadiologyFindings';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'RadiologyFindings';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ProgressMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PhysiotherapyTreatmentDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OperationsProcedures';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OperationsProcedures';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OperationsProcedures';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OperationsProcedures';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OperationsProcedures';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OperationsProcedures';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'NotStabilisedReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'ProgressMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';

