CREATE TABLE [common].[ProstheticQuoteStatus] (
    [Name] VARCHAR (50) NOT NULL,
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    CONSTRAINT [PK_ProstheticQuoteStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

