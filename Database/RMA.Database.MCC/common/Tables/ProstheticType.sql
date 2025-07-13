CREATE TABLE [common].[ProstheticType] (
    [Name] VARCHAR (50) NULL,
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    CONSTRAINT [PK_ProstheticType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

