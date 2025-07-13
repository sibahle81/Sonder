CREATE TABLE [common].[EntryChangeReason] (
    [Id]   INT          IDENTITY (0, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_EntryChangeReason] PRIMARY KEY CLUSTERED ([Id] ASC)
);

