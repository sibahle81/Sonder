CREATE TABLE [pension].[ProcessTebaFile] (
    [Id]            INT          IDENTITY (1, 1) NOT NULL,
    [DocumentId]    INT          NULL,
    [IsProcessed]   BIT          NOT NULL,
    [Failed]        BIT          NOT NULL,
    [ErrorMessage]  VARCHAR (50) NOT NULL,
    [RetryAttempts] INT          NULL,
    [IsActive]      BIT          NOT NULL,
    [IsDeleted]     BIT          NOT NULL,
    [CreatedBy]     VARCHAR (50) NOT NULL,
    [CreatedDate]   DATETIME     NOT NULL,
    [ModifiedBy]    VARCHAR (50) NOT NULL,
    [ModifiedDate]  DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProcessTebaFile_Document] FOREIGN KEY ([DocumentId]) REFERENCES [documents].[Document] ([Id])
);

