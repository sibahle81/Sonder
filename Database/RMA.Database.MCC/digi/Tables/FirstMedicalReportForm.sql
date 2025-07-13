CREATE TABLE [digi].[FirstMedicalReportForm] (
    [FirstMedicalReportFormId]    INT             IDENTITY (1, 1) NOT NULL,
    [MedicalReportFormId]         INT             NOT NULL,
    [MechanismOfInjury]           NVARCHAR (256)  NOT NULL,
    [ClinicalDescription]         NVARCHAR (256)  NOT NULL,
    [IsInjuryMechanismConsistent] BIT             CONSTRAINT [DF__FirstMedi__IsInj__1610DF35] DEFAULT ((0)) NOT NULL,
    [IsPreExistingConditions]     BIT             CONSTRAINT [DF__FirstMedi__IsPre__17F927A7] DEFAULT ((0)) NOT NULL,
    [PreExistingConditions]       NVARCHAR (1000) NULL,
    [FirstDayOff]                 DATETIME        NULL,
    [LastDayOff]                  DATETIME        NULL,
    [EstimatedDaysOff]            INT             NULL,
    CONSTRAINT [PK_FirstMedicalReportForm] PRIMARY KEY CLUSTERED ([FirstMedicalReportFormId] ASC),
    CONSTRAINT [FK_FirstMedicalReportForm_MedicalReport] FOREIGN KEY ([MedicalReportFormId]) REFERENCES [digi].[MedicalReportForm] ([MedicalReportFormId])
);








GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'PreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'MechanismOfInjury';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsPreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsPreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsPreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsPreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsPreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsPreExistingConditions';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsInjuryMechanismConsistent';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsInjuryMechanismConsistent';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsInjuryMechanismConsistent';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsInjuryMechanismConsistent';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsInjuryMechanismConsistent';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'IsInjuryMechanismConsistent';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'FirstMedicalReportFormId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'FirstMedicalReportForm', @level2type = N'COLUMN', @level2name = N'ClinicalDescription';

