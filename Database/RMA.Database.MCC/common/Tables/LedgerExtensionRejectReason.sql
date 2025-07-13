CREATE TABLE [common].[LedgerExtensionRejectReason] (
    [Id]   INT          IDENTITY (1, 1) NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK__commom_LedgerExtensionRejectReason] PRIMARY KEY CLUSTERED ([Id] ASC)
);

