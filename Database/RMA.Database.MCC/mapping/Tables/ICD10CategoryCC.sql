CREATE TABLE [mapping].[ICD10CategoryCC] (
    [ICD10CategoryID] INT            NOT NULL,
    [Description]     VARCHAR (2048) NULL,
    [IsActive]        INT            NULL,
    [LastChangedBy]   VARCHAR (30)   NULL,
    [LastChangedDate] DATETIME       NULL,
    [Code]            VARCHAR (12)   NOT NULL
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'ICD10CategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'ICD10CategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'ICD10CategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'ICD10CategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'ICD10CategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'ICD10CategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CategoryCC', @level2type = N'COLUMN', @level2name = N'Code';

