CREATE TABLE [common].[PostalCode] (
    [PostalCodeID]       INT           IDENTITY (1, 1) NOT NULL,
    [Suburb]             VARCHAR (255) NOT NULL,
    [POBoxPostalCode]    VARCHAR (10)  NULL,
    [StreetPostalCode]   VARCHAR (12)  NULL,
    [IsManuallyModified] BIT           CONSTRAINT [DF_Pension_PostalCode_IsManuallyModified] DEFAULT ((0)) NOT NULL,
    [LastChangedBy]      VARCHAR (30)  NULL,
    [LastChangedDate]    DATETIME      NULL,
    [CityID]             INT           NULL,
    CONSTRAINT [PK_Pension_PostalCode_PostalCodeID] PRIMARY KEY CLUSTERED ([PostalCodeID] ASC) WITH (FILLFACTOR = 95)
);


GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'Suburb';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'Suburb';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'Suburb';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'Suburb';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'Suburb';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'Suburb';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'StreetPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'StreetPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'StreetPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'StreetPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'StreetPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'StreetPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'PostalCodeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'PostalCodeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'PostalCodeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'PostalCodeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'PostalCodeID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'PostalCodeID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'POBoxPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'POBoxPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'POBoxPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'POBoxPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'POBoxPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'POBoxPostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'LastChangedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'IsManuallyModified';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'IsManuallyModified';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'IsManuallyModified';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'IsManuallyModified';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'IsManuallyModified';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'IsManuallyModified';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'CityID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'CityID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'CityID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'CityID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'CityID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'PostalCode', @level2type = N'COLUMN', @level2name = N'CityID';

