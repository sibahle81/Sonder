CREATE TABLE [common].[PaymentReversalReason] (
    [Id]   INT           NOT NULL,
    [Name] VARCHAR (255) NOT NULL,
    CONSTRAINT [PK_PaymentReversalReason] PRIMARY KEY CLUSTERED ([Id] ASC)
);

