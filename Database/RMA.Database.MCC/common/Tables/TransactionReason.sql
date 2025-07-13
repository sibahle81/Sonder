CREATE TABLE [common].[TransactionReason] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.TransactionReason] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.TransactionReason_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);

