CREATE TABLE [digi].[FinalDiseaseMedicalReportForm] (
    [FinalDiseaseMedicalReportFormId] INT            IDENTITY (1, 1) NOT NULL,
    [MedicalReportFormId]             INT            NOT NULL,
    [DateReturnToWork]                DATE           NULL,
    [StabilisedDate]                  DATE           NULL,
    [OccupationChangeDetails]         VARCHAR (1000) NULL,
    [PermanentFunctionalLoss]         VARCHAR (1000) NULL,
    [ConditionStabilisedDetails]      VARCHAR (1000) NULL,
    CONSTRAINT [PK_digi.FinalDiseaseMedicalReportForm] PRIMARY KEY CLUSTERED ([FinalDiseaseMedicalReportFormId] ASC),
    CONSTRAINT [FK_FinalDiseaseMedicalReportForm_MedicalReport] FOREIGN KEY ([MedicalReportFormId]) REFERENCES [digi].[MedicalReportForm] ([MedicalReportFormId])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'StabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'StabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'StabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'StabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'StabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'StabilisedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PermanentFunctionalLoss';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PermanentFunctionalLoss';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PermanentFunctionalLoss';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PermanentFunctionalLoss';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PermanentFunctionalLoss';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PermanentFunctionalLoss';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OccupationChangeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OccupationChangeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OccupationChangeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OccupationChangeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OccupationChangeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'OccupationChangeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FinalDiseaseMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'DateReturnToWork';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ConditionStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ConditionStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ConditionStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ConditionStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ConditionStabilisedDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FinalDiseaseMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ConditionStabilisedDetails';

