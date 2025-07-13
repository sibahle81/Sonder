CREATE TABLE [documents].[DocumentKeys] (
    [Id]           INT          IDENTITY (1, 1) NOT NULL,
    [DocumentId]   INT          NOT NULL,
    [KeyName]      VARCHAR (50) NOT NULL,
    [KeyValue]     VARCHAR (50) NOT NULL,
    [IsDeleted]    BIT          NOT NULL,
    [CreatedBy]    VARCHAR (50) NOT NULL,
    [CreatedDate]  DATETIME     CONSTRAINT [DF_DocKeys_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     CONSTRAINT [DF_DocKeys_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_DocumentKeys] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_DocumentKeys_Document] FOREIGN KEY ([DocumentId]) REFERENCES [documents].[Document] ([Id])
);




GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyValue';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyValue';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyValue';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyValue';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyValue';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyValue';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'KeyName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'DocumentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'DocumentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'DocumentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'DocumentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'DocumentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'DocumentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'DocumentKeys', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
CREATE NONCLUSTERED INDEX [IX_DocumentKeys_KeyName_KeyValue]
    ON [documents].[DocumentKeys]([KeyName] ASC, [KeyValue] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_DocumentKeys_IsDeleted]
    ON [documents].[DocumentKeys]([IsDeleted] ASC)
    INCLUDE([DocumentId], [KeyName], [KeyValue]);

