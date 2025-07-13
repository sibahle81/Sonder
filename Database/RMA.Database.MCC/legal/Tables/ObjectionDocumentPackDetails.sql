CREATE TABLE [legal].[ObjectionDocumentPackDetails] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [ObjectionId]    INT           NOT NULL,
    [DocumentPackId] INT           NULL,
    [DocumentId]     INT           NOT NULL,
    [DocumentName]   VARCHAR (500) NOT NULL,
    [IsActive]       BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]      BIT           NOT NULL,
    [CreatedBy]      VARCHAR (100) NOT NULL,
    [CreatedDate]    DATETIME      NOT NULL,
    [ModifiedBy]     VARCHAR (100) NOT NULL,
    [ModifiedDate]   DATETIME      NOT NULL,
    CONSTRAINT [PK_ObjectionDocumentPackDetails] PRIMARY KEY CLUSTERED ([Id] ASC)
);

