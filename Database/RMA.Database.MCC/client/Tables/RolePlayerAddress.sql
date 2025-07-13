CREATE TABLE [client].[RolePlayerAddress] (
    [RolePlayerId]        INT                                               NOT NULL,
    [AddressTypeId]       INT                                               NOT NULL,
    [AddressLine1]        VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [AddressLine2]        VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [PostalCode]          VARCHAR (15) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [City]                VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [Province]            VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [CountryId]           INT                                               NOT NULL,
    [IsDeleted]           BIT                                               NOT NULL,
    [CreatedBy]           VARCHAR (50)                                      NOT NULL,
    [CreatedDate]         DATETIME                                          NOT NULL,
    [ModifiedBy]          VARCHAR (50)                                      NOT NULL,
    [ModifiedDate]        DATETIME                                          NOT NULL,
    [RolePlayerAddressId] INT                                               IDENTITY (1, 1) NOT NULL,
    [EffectiveDate]       DATETIME                                          NOT NULL,
    [IsPrimary]           BIT                                               NULL,
    CONSTRAINT [PK_RolePlayerAddress] PRIMARY KEY CLUSTERED ([RolePlayerAddressId] ASC),
    CONSTRAINT [FK_RolePlayerAddress_AddressType] FOREIGN KEY ([AddressTypeId]) REFERENCES [common].[AddressType] ([Id]),
    CONSTRAINT [FK_RolePlayerAddress_Country] FOREIGN KEY ([CountryId]) REFERENCES [common].[Country] ([Id]),
    CONSTRAINT [FK_RolePlayerAddress_RolePlayer] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);




GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerAddressId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerAddressId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerAddressId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerAddressId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerAddressId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'RolePlayerAddressId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
CREATE NONCLUSTERED INDEX [IX_RolePlayerAddress_RolePlayerId]
    ON [client].[RolePlayerAddress]([RolePlayerId] ASC)
    INCLUDE([AddressLine1], [PostalCode], [City]);

