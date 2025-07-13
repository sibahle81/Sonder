CREATE TABLE [mapping].[ICD10DiagnosticGroupCC] (
    [ICD10DiagnosticGroupID] INT            NOT NULL,
    [Code]                   VARCHAR (12)   NOT NULL,
    [Description]            VARCHAR (2048) NULL,
    [IsActive]               TINYINT        NOT NULL,
    [LastChangedBy]          VARCHAR (30)   NULL,
    [LastChangedDate]        DATETIME       NULL,
    [PMPDRGID]               INT            NULL,
    [Name]                   VARCHAR (10)   NULL,
    [ICD10CodeRange]         VARCHAR (50)   NULL,
    [SCheduleAsOfDate]       DATETIME       NULL,
    [ScheduleMonths]         TINYINT        NULL
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ScheduleMonths';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ScheduleMonths';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ScheduleMonths';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ScheduleMonths';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ScheduleMonths';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ScheduleMonths';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'SCheduleAsOfDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'SCheduleAsOfDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'SCheduleAsOfDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'SCheduleAsOfDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'SCheduleAsOfDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'SCheduleAsOfDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'PMPDRGID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'PMPDRGID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'PMPDRGID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'PMPDRGID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'PMPDRGID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'PMPDRGID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeRange';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeRange';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeRange';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeRange';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeRange';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'ICD10CodeRange';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'ICD10DiagnosticGroupCC', @level2type = N'COLUMN', @level2name = N'Code';

