CREATE TABLE [common].[BatchStatus] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    UNIQUE NONCLUSTERED ([Id] ASC)
);

