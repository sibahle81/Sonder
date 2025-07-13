CREATE TABLE [digi].[MedicalReportCategory] (
    [MedicalReportCategoryId]          INT                                         IDENTITY (1, 1) NOT NULL,
    [MedicalReportCategoryName]        VARCHAR (100)                               NOT NULL,
    [MedicalReportCategoryDescription] VARCHAR (200)                               NOT NULL,
    [TenantId]                         INT                                         NOT NULL,
    [IsDeleted]                        BIT                                         DEFAULT ((0)) NOT NULL,
    [CreatedDate]                      DATETIME2 (7)                               NOT NULL,
    [CreatedBy]                        VARCHAR (50)                                NOT NULL,
    [ModifiedDate]                     DATETIME2 (7)                               NOT NULL,
    [ModifiedBy]                       VARCHAR (50)                                NOT NULL,
    [AuditStartDate]                   DATETIME2 (7) GENERATED ALWAYS AS ROW START NOT NULL,
    [AuditEndDate]                     DATETIME2 (7) GENERATED ALWAYS AS ROW END   NOT NULL,
    PRIMARY KEY CLUSTERED ([MedicalReportCategoryId] ASC),
    CONSTRAINT [FK_MedicalReportCategory_Tenant] FOREIGN KEY ([TenantId]) REFERENCES [security].[Tenant] ([Id]),
    PERIOD FOR SYSTEM_TIME ([AuditStartDate], [AuditEndDate])
)
WITH (SYSTEM_VERSIONING = ON (HISTORY_TABLE=[digi].[MedicalReportCategoryAudit], DATA_CONSISTENCY_CHECK=ON));


GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'MedicalReportCategoryDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'MedicalReportCategory', @level2type = N'COLUMN', @level2name = N'AuditEndDate';

