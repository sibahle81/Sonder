CREATE TABLE [common].[CommutationEntryStatus] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_CommutationEntryStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

