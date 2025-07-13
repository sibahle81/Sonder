CREATE TABLE [broker].[BrokerageAddress] (
    [Id]            INT                                               IDENTITY (1, 1) NOT NULL,
    [BrokerageId]   INT                                               NOT NULL,
    [AddressTypeId] INT                                               NOT NULL,
    [AddressLine1]  VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [AddressLine2]  VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [PostalCode]    VARCHAR (15) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [City]          VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [Province]      VARCHAR (50) MASKED WITH (FUNCTION = 'default()') NULL,
    [CountryId]     INT                                               NOT NULL,
    [IsDeleted]     BIT                                               NOT NULL,
    [CreatedBy]     VARCHAR (50)                                      NOT NULL,
    [CreatedDate]   DATETIME                                          NOT NULL,
    [ModifiedBy]    VARCHAR (50)                                      NOT NULL,
    [ModifiedDate]  DATETIME                                          NOT NULL,
    CONSTRAINT [PK_broker.Address] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_BrokerageAddress_AddressType] FOREIGN KEY ([AddressTypeId]) REFERENCES [common].[AddressType] ([Id]),
    CONSTRAINT [FK_BrokerageAddress_Brokerage] FOREIGN KEY ([BrokerageId]) REFERENCES [broker].[Brokerage] ([Id]),
    CONSTRAINT [FK_BrokerageAddress_Country] FOREIGN KEY ([CountryId]) REFERENCES [common].[Country] ([Id])
);


GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'CountryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'broker', @level1type = N'TABLE', @level1name = N'BrokerageAddress', @level2type = N'COLUMN', @level2name = N'AddressLine1';

