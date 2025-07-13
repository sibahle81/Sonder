CREATE TABLE [campaign].[SmsAudit] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [ItemType]           VARCHAR (50)  NULL,
    [ItemId]             INT           NULL,
    [isSuccess]          BIT           NULL,
    [SmsNumbers]         VARCHAR (MAX) NULL,
    [Message]            VARCHAR (MAX) NULL,
    [ProcessDescription] VARCHAR (MAX) NULL,
    [Department]         VARCHAR (100) NULL,
    [IsActive]           BIT           NOT NULL,
    [IsDeleted]          BIT           NOT NULL,
    [CreatedBy]          VARCHAR (50)  NOT NULL,
    [CreatedDate]        DATETIME      NOT NULL,
    [ModifiedBy]         VARCHAR (50)  NOT NULL,
    [ModifiedDate]       DATETIME      NOT NULL,
    [SmsReference]       VARCHAR (50)  NULL,
    CONSTRAINT [PK_SmsAudit] PRIMARY KEY CLUSTERED ([Id] ASC)
);








GO
CREATE NONCLUSTERED INDEX [Campaign_SmsAudit_ItemType_ItemId_isSuccess]
    ON [campaign].[SmsAudit]([ItemType] ASC, [ItemId] ASC, [isSuccess] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'SmsNumbers';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'SmsNumbers';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'SmsNumbers';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'SmsNumbers';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'SmsNumbers';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'SmsNumbers';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ProcessDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ProcessDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ProcessDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ProcessDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ProcessDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ProcessDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Message';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Message';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Message';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Message';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Message';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Message';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'isSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'isSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'isSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'isSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'isSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'isSuccess';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Department';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Department';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Department';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Department';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Department';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'Department';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'SmsAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
CREATE NONCLUSTERED INDEX [IX_SmsAudit_ItemId]
    ON [campaign].[SmsAudit]([ItemId] ASC)
    INCLUDE([Message]);


GO
CREATE NONCLUSTERED INDEX [IX_SmsAudit_isSuccess_IsDeleted_CreatedDate]
    ON [campaign].[SmsAudit]([isSuccess] ASC, [IsDeleted] ASC, [CreatedDate] ASC);

