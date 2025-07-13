CREATE TABLE [documents].[Document] (
    [Id]                  INT            IDENTITY (1, 1) NOT NULL,
    [DocTypeId]           INT            NOT NULL,
    [SystemName]          VARCHAR (50)   NOT NULL,
    [DocumentUri]         VARCHAR (1024) NULL,
    [verifiedBy]          VARCHAR (50)   NULL,
    [verifiedByDate]      DATETIME       NULL,
    [FileHash]            VARCHAR (255)  NULL,
    [FileName]            VARCHAR (255)  NOT NULL,
    [FileExtension]       VARCHAR (50)   NOT NULL,
    [DocumentStatusId]    INT            NULL,
    [IsDeleted]           BIT            NOT NULL,
    [CreatedBy]           VARCHAR (50)   NOT NULL,
    [CreatedDate]         DATETIME       CONSTRAINT [DF_DocMetaData_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]          VARCHAR (50)   NOT NULL,
    [ModifiedDate]        DATETIME       CONSTRAINT [DF_DocMetaData_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    [DocumentDescription] NVARCHAR (150) NULL,
    CONSTRAINT [PK_Document] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Document_DocumentType] FOREIGN KEY ([DocTypeId]) REFERENCES [documents].[DocumentType] ([Id]),
    CONSTRAINT [FK_DocumentStatus_Document] FOREIGN KEY ([DocumentStatusId]) REFERENCES [common].[DocumentStatus] ([Id])
);






GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedByDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedByDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedByDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedByDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedByDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedByDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'verifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'SystemName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'SystemName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'SystemName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'SystemName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'SystemName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'SystemName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileHash';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileHash';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileHash';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileHash';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileHash';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileHash';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileExtension';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileExtension';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileExtension';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileExtension';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileExtension';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'FileExtension';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentUri';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentUri';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentUri';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentUri';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentUri';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentUri';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocumentDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'DocTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'documents', @level1type = N'TABLE', @level1name = N'Document', @level2type = N'COLUMN', @level2name = N'CreatedBy';

