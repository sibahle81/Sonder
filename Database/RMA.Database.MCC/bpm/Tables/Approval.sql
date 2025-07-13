CREATE TABLE [bpm].[Approval] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [ItemId]         INT           NOT NULL,
    [ItemType]       VARCHAR (50)  NOT NULL,
    [ApprovalTypeId] INT           NOT NULL,
    [Approved]       BIT           NOT NULL,
    [Comment]        VARCHAR (MAX) NOT NULL,
    [ApprovalDate]   DATETIME      NOT NULL,
    [ApprovalBy]     VARCHAR (50)  NOT NULL,
    CONSTRAINT [PK_Approval] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Apporval_ApprovalType] FOREIGN KEY ([ApprovalTypeId]) REFERENCES [common].[ApprovalType] ([Id])
);


GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Comment';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Comment';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Comment';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Comment';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Comment';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Comment';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Approved';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Approved';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Approved';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Approved';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Approved';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'Approved';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Approval', @level2type = N'COLUMN', @level2name = N'ApprovalBy';

