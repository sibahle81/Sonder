CREATE TABLE [campaign].[AuditLog] (
    [Id]               INT           IDENTITY (1, 1) NOT NULL,
    [ItemId]           INT           NOT NULL,
    [ItemType]         VARCHAR (50)  NOT NULL,
    [Action]           VARCHAR (50)  NOT NULL,
    [OldItem]          VARCHAR (MAX) NOT NULL,
    [NewItem]          VARCHAR (MAX) NOT NULL,
    [Date]             DATETIME      NOT NULL,
    [Username]         VARCHAR (50)  NOT NULL,
    [CorrolationToken] VARCHAR (50)  NULL,
    CONSTRAINT [PK_campaign.AuditLog] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Username';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Username';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Username';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Username';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Username';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Username';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'OldItem';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'OldItem';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'OldItem';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'OldItem';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'OldItem';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'OldItem';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'NewItem';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'NewItem';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'NewItem';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'NewItem';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'NewItem';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'NewItem';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Date';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'CorrolationToken';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'CorrolationToken';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'CorrolationToken';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'CorrolationToken';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'CorrolationToken';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'CorrolationToken';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'campaign', @level1type = N'TABLE', @level1name = N'AuditLog', @level2type = N'COLUMN', @level2name = N'Action';

