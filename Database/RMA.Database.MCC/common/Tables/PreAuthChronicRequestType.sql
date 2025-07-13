CREATE TABLE [common].[PreAuthChronicRequestType] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common_PreAuthChronicRequestType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

