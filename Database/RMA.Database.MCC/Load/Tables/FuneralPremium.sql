CREATE TABLE [Load].[FuneralPremium] (
    [Name]           VARCHAR (1000)                                      NULL,
    [Surname]        VARCHAR (1000)                                      NULL,
    [IDNumber]       VARCHAR (1000) MASKED WITH (FUNCTION = 'default()') NULL,
    [DateofBirth]    VARCHAR (1000)                                      NULL,
    [PassportNumber] VARCHAR (1000)                                      NULL,
    [Industrynumber] VARCHAR (1000)                                      NULL,
    [Company]        VARCHAR (1000)                                      NULL,
    [Country]        VARCHAR (1000)                                      NULL,
    [Date]           VARCHAR (1000)                                      NULL,
    [TotalAmount]    VARCHAR (1000) MASKED WITH (FUNCTION = 'default()') NULL,
    [ExecutionID]    UNIQUEIDENTIFIER                                    NOT NULL,
    [FileIdentifier] VARCHAR (1000)                                      NOT NULL,
    [FileName]       VARCHAR (2000)                                      NOT NULL,
    [PolicyNr]       VARCHAR (110)                                       NULL,
    [IsProcessed]    BIT                                                 DEFAULT ((0)) NULL,
    [DateProcessed]  DATETIME                                            NULL
);


GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PolicyNr';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PolicyNr';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PolicyNr';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PolicyNr';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PolicyNr';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PolicyNr';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PassportNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PassportNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PassportNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PassportNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PassportNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'PassportNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Industrynumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Industrynumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Industrynumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Industrynumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Industrynumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Industrynumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IDNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IDNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IDNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IDNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IDNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'IDNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'ExecutionID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'ExecutionID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'ExecutionID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'ExecutionID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'ExecutionID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'ExecutionID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateofBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateofBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateofBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateofBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateofBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'DateofBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'FuneralPremium', @level2type = N'COLUMN', @level2name = N'Company';

