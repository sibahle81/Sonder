CREATE TABLE [common].[ChangeReason] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.ChangeReason] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.ChangeReason] UNIQUE NONCLUSTERED ([Name] ASC)
);

