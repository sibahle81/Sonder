CREATE TABLE [common].[TebaStatus] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_commonTebaStatus] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_commonTebaStatus_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

