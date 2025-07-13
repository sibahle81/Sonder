CREATE TABLE [common].[RegistrationType] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_RegistrationType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

