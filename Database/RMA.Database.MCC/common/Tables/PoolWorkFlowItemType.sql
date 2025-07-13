CREATE TABLE [common].[PoolWorkFlowItemType] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.PoolWorkFlowItemType] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.PoolWorkFlowItemType_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

