CREATE TABLE [digi].[IntegrationLogging] (
    [Id]                INT           IDENTITY (1, 1) NOT NULL,
    [IsRequest]         BIT           NOT NULL,
    [IntegrationName]   VARCHAR (250) NOT NULL,
    [SerializedPayload] VARCHAR (MAX) NULL,
    [IsDeleted]         BIT           CONSTRAINT [DF_digi.IntegrationLogging_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedDate]       DATETIME      CONSTRAINT [DF_digi.IntegrationLogging_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]         NVARCHAR (50) NOT NULL,
    [ModifiedDate]      DATETIME      CONSTRAINT [DF_digi.IntegrationLogging_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]        VARCHAR (50)  NOT NULL,
    CONSTRAINT [PK_digi.IntegrationLogging] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'SerializedPayload';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'SerializedPayload';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'SerializedPayload';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'SerializedPayload';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'SerializedPayload';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'SerializedPayload';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsRequest';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsRequest';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsRequest';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsRequest';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsRequest';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsRequest';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IntegrationName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IntegrationName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IntegrationName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IntegrationName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IntegrationName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'IntegrationName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'digi', @level1type = N'TABLE', @level1name = N'IntegrationLogging', @level2type = N'COLUMN', @level2name = N'CreatedBy';

