CREATE TABLE [common].[COLReceiveMethod] (
    [Id]   INT           NOT NULL,
    [Name] VARCHAR (100) NOT NULL,
    CONSTRAINT [PK_common.COLReceiveMethod] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.COLReceiveMethod_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

