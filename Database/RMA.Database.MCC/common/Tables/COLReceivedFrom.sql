CREATE TABLE [common].[COLReceivedFrom] (
    [Id]   INT           NOT NULL,
    [Name] VARCHAR (100) NOT NULL,
    CONSTRAINT [PK_common.COLReceivedFrom] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.COLReceivedFrom_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

