CREATE TABLE [documents].[DocumentSetDocumentType] (
    [Id]                INT          NOT NULL,
    [DocTypeId]         INT          NOT NULL,
    [DocumentSetId]     INT          NOT NULL,
    [Required]          BIT          NOT NULL,
    [IsDeleted]         BIT          NOT NULL,
    [CreatedBy]         VARCHAR (50) NOT NULL,
    [CreatedDate]       DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]        VARCHAR (50) NOT NULL,
    [ModifiedDate]      DATETIME     DEFAULT (getdate()) NOT NULL,
    [TemplateAvailable] BIT          DEFAULT ((0)) NOT NULL,
    [StatusEnabled]     BIT          DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_DocumentSet_DocumentType] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_DocumentSet_DocumentSet] FOREIGN KEY ([DocumentSetId]) REFERENCES [common].[DocumentSet] ([Id]),
    CONSTRAINT [FK_DocumentSet_DocumentType] FOREIGN KEY ([DocTypeId]) REFERENCES [documents].[DocumentType] ([Id])
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


