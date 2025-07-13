CREATE TABLE [medical].[ICD10DiagnosticGroup] (
    [ICD10DiagnosticGroupId] INT            IDENTITY (1, 1) NOT NULL,
    [Code]                   VARCHAR (5)    NOT NULL,
    [Description]            VARCHAR (1000) NOT NULL,
    [IsActive]               BIT            CONSTRAINT [DF_ICD10DiagnosticGroup_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]              BIT            CONSTRAINT [DF_ICD10DiagnosticGroup_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50)   NOT NULL,
    [CreatedDate]            DATETIME       CONSTRAINT [DF_ICD10DiagnosticGroup_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50)   NOT NULL,
    [ModifiedDate]           DATETIME       CONSTRAINT [DF_ICD10DiagnosticGroup_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_ICD10DiagnosticGroup] PRIMARY KEY CLUSTERED ([ICD10DiagnosticGroupId] ASC)
);








GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroup', @level2type = N'COLUMN', @level2name = N'Code';

