CREATE TABLE [Load].[ConsolidatedFuneralBank] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [IdNumber]       VARCHAR (32)     NOT NULL,
    [Bank]           VARCHAR (64)     NOT NULL,
    [BranchCode]     VARCHAR (16)     NOT NULL,
    [AccountNo]      VARCHAR (32)     NOT NULL,
    [AccountType]    VARCHAR (32)     NOT NULL,
    CONSTRAINT [PK__ConsolidatedFuneralBank] PRIMARY KEY CLUSTERED ([Id] ASC)
);

