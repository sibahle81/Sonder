CREATE TABLE [lead].[Address] (
    [AddressId]     INT                                               IDENTITY (1, 1) NOT NULL,
    [LeadId]        INT                                               NOT NULL,
    [AddressTypeId] INT                                               NOT NULL,
    [AddressLine1]  VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [AddressLine2]  VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [PostalCode]    VARCHAR (15) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [City]          VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [Province]      VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [CountryId]     INT                                               NULL,
    [IsDeleted]     BIT                                               CONSTRAINT [DF_Address_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]     VARCHAR (50)                                      NOT NULL,
    [CreatedDate]   DATETIME                                          CONSTRAINT [DF_Address_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]    VARCHAR (50)                                      NOT NULL,
    [ModifiedDate]  DATETIME                                          CONSTRAINT [DF_Address_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_AddressId] PRIMARY KEY CLUSTERED ([AddressId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Address_AddressType] FOREIGN KEY ([AddressTypeId]) REFERENCES [common].[AddressType] ([Id]),
    CONSTRAINT [FK_Lead_Address_CountryId] FOREIGN KEY ([CountryId]) REFERENCES [common].[Country] ([Id]),
    CONSTRAINT [FK_Lead_Address_LeadId] FOREIGN KEY ([LeadId]) REFERENCES [lead].[Lead] ([LeadId])
);


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Address', @level2type = N'COLUMN', @level2name = N'AddressId';

