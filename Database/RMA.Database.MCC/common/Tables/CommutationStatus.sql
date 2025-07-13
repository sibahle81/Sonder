CREATE TABLE [common].[CommutationStatus] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_CommutationStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

