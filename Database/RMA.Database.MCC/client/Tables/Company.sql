CREATE TABLE [client].[Company] (
    [RolePlayerId]                    INT                                                NOT NULL,
    [Name]                            VARCHAR (255) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [Description]                     VARCHAR (255)                                      NULL,
    [ReferenceNumber]                 VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NOT NULL,
    [CompensationFundReferenceNumber] VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NULL,
    [CompanyIdTypeId]                 INT                                                CONSTRAINT [DF_Company_IdType] DEFAULT ((1)) NOT NULL,
    [IdNumber]                        VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NULL,
    [VatRegistrationNo]               VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NULL,
    [IndustryId]                      INT                                                NULL,
    [IndustryClassId]                 INT                                                NULL,
    [CompanyLevelId]                  INT                                                CONSTRAINT [DF_Company_GroupLevelId] DEFAULT ((2)) NULL,
    [IsDeleted]                       BIT                                                NOT NULL,
    [CreatedBy]                       VARCHAR (50)                                       NOT NULL,
    [CreatedDate]                     DATETIME                                           NOT NULL,
    [ModifiedBy]                      VARCHAR (50)                                       NOT NULL,
    [ModifiedDate]                    DATETIME                                           NOT NULL,
    [LinkedCompanyId]                 INT                                                NULL,
    [IsTopEmployer]                   BIT                                                DEFAULT ((0)) NOT NULL,
    [NatureOfBusiness]                VARCHAR (255)                                      NULL,
    [CompensationFundStatusId]        INT                                                NULL,
    [BranchId]                        INT                                                NULL,
    CONSTRAINT [PK_Company] PRIMARY KEY CLUSTERED ([RolePlayerId] ASC),
    CONSTRAINT [FK_Company_CompanyLevel] FOREIGN KEY ([CompanyLevelId]) REFERENCES [common].[CompanyLevel] ([Id]),
    CONSTRAINT [FK_Company_IdType] FOREIGN KEY ([CompanyIdTypeId]) REFERENCES [common].[CompanyIdType] ([Id]),
    CONSTRAINT [FK_RolePlayerCompany_RolePlayer] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId]),
    CONSTRAINT [FK_Company_Branch] FOREIGN KEY ([BranchId]) REFERENCES [common].[Branch] ([Id])
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
CREATE UNIQUE NONCLUSTERED INDEX [uidx_company_reg_no]
    ON [client].[Company]([ReferenceNumber] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_company_name]
    ON [client].[Company]([Name] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'VatRegistrationNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LinkedCompanyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LinkedCompanyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LinkedCompanyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LinkedCompanyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LinkedCompanyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LinkedCompanyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyLevelId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyLevelId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyLevelId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyLevelId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyLevelId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyLevelId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyIdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyIdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyIdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyIdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyIdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompanyIdTypeId';

