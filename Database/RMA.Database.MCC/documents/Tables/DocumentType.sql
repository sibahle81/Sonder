CREATE TABLE [documents].[DocumentType] (
    [Id]           INT           NOT NULL,
    [Name]         VARCHAR (255) NOT NULL,
    [ValidDays]    INT           NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (50)  NOT NULL,
    [CreatedDate]  DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   VARCHAR (50)  NOT NULL,
    [ModifiedDate] DATETIME      DEFAULT (getdate()) NOT NULL,
    [Manager]      VARCHAR (255) NULL,
    CONSTRAINT [PK_Document_DocumentType] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
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


