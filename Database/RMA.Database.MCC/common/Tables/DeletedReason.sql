CREATE TABLE [common].[DeletedReason] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_DeletedReason] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_DeletedReason_DeletedReason] FOREIGN KEY ([Id]) REFERENCES [common].[DeletedReason] ([Id])
);

