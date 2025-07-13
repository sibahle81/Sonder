CREATE TABLE [common].[COLReceiveType] (
    [Id]   INT           NOT NULL,
    [Name] VARCHAR (100) NOT NULL,
    CONSTRAINT [PK_common.COLReceiveType] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.COLReceiveType_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

