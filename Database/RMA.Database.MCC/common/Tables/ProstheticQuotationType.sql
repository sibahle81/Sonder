CREATE TABLE [common].[ProstheticQuotationType] (
    [Name] VARCHAR (50) NOT NULL,
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    CONSTRAINT [PK_ProstheticQuotationType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

