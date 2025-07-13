CREATE TABLE [mapping].[ICD10CodeIsPrimaryOnProductCC] (
    [ICD10CodeIsPrimaryOnProductID] INT          NOT NULL,
    [ICD10DiagnosticGroupID]        INT          NOT NULL,
    [ICD10CodeID]                   INT          NOT NULL,
    [ProductID]                     INT          NOT NULL,
    [EventCategoryID]               INT          NOT NULL,
    [IsPrimary]                     BIT          NOT NULL,
    [IsSecondary]                   BIT          NOT NULL,
    [IsActive]                      BIT          NOT NULL,
    [LastChangedBy]                 VARCHAR (30) NULL,
    [LastChangedDate]               DATETIME     NULL
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ProductID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ProductID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ProductID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ProductID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ProductID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ProductID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsSecondary';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsSecondary';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsSecondary';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsSecondary';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsSecondary';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsSecondary';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsPrimary';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsPrimary';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsPrimary';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsPrimary';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsPrimary';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsPrimary';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeIsPrimaryOnProductID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeIsPrimaryOnProductID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeIsPrimaryOnProductID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeIsPrimaryOnProductID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeIsPrimaryOnProductID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeIsPrimaryOnProductID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'EventCategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'EventCategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'EventCategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'EventCategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'EventCategoryID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10CodeIsPrimaryOnProductCC', @level2type = N'COLUMN', @level2name = N'EventCategoryID';

