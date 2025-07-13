CREATE TABLE [lead].[Company] (
    [LeadId]                             INT                                                NOT NULL,
    [Name]                               VARCHAR (255) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [RegistrationTypeId]                 INT                                                NOT NULL,
    [RegistrationNumber]                 VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NOT NULL,
    [CompensationFundReferenceNumber]    VARCHAR (50)                                       NULL,
    [CompensationFundRegistrationNumber] VARCHAR (50)                                       NULL,
    [IndustryClassId]                    INT                                                NOT NULL,
    [IndustryTypeId]                     INT                                                NOT NULL,
    [IsDeleted]                          BIT                                                CONSTRAINT [DF_Company_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                          VARCHAR (50)                                       NOT NULL,
    [CreatedDate]                        DATETIME                                           CONSTRAINT [DF_Company_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                         VARCHAR (50)                                       NOT NULL,
    [ModifiedDate]                       DATETIME                                           CONSTRAINT [DF_Company_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Company_2] PRIMARY KEY CLUSTERED ([LeadId] ASC),
    CONSTRAINT [FK_Company_Industry] FOREIGN KEY ([IndustryTypeId]) REFERENCES [common].[Industry] ([Id]),
    CONSTRAINT [FK_IdTypeCompany_RegistrationTypeId] FOREIGN KEY ([RegistrationTypeId]) REFERENCES [common].[CompanyIdType] ([Id]),
    CONSTRAINT [FK_Lead_Company_LeadId] FOREIGN KEY ([LeadId]) REFERENCES [lead].[Lead] ([LeadId]),
    CONSTRAINT [UN_RegistrationNumber] UNIQUE NONCLUSTERED ([RegistrationNumber] ASC)
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
CREATE UNIQUE NONCLUSTERED INDEX [IX_Company]
    ON [lead].[Company]([LeadId] ASC);


GO
CREATE UNIQUE NONCLUSTERED INDEX [IDX_Company_LeadId]
    ON [lead].[Company]([LeadId] ASC) WHERE ([LeadId] IS NOT NULL);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'RegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'LeadId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundRegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundRegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundRegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundRegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundRegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundRegistrationNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'lead', @level1type = N'TABLE', @level1name = N'Company', @level2type = N'COLUMN', @level2name = N'CompensationFundReferenceNumber';

