CREATE TABLE [common].[PensionIncreaseStatus] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_PensionIncreaseStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

