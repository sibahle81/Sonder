CREATE TABLE [common].[CertificateOfLifeStatus] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_COLStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

