CREATE TABLE [common].[PensionIncreaseType] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_PensionIncreaseType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

