CREATE TABLE [common].[PopulationGroup] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK__common_PopulationGroup] PRIMARY KEY CLUSTERED ([Id] ASC)
);

