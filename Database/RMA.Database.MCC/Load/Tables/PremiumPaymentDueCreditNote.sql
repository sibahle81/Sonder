CREATE TABLE [Load].[PremiumPaymentDueCreditNote] (
    [PremiumPaymentDueCreditNoteId] INT             IDENTITY (1, 1) NOT NULL,
    [PolicyId]                      INT             NOT NULL,
    [InvoiceDate]                   DATETIME        NOT NULL,
    [IsProcessed]                   BIT             NULL,
    [ProccessingDate]               DATETIME        NULL,
    [RoleplayerId]                  INT             NOT NULL,
    [PremiumListingPaymentFileId]   INT             NOT NULL,
    [FileTotal]                     DECIMAL (18, 2) NOT NULL,
    CONSTRAINT [PK_PremiumPaymentDueCreditNote] PRIMARY KEY CLUSTERED ([PremiumPaymentDueCreditNoteId] ASC),
    CONSTRAINT [FK_PremiumPaymentDueCreditNote_PremiumListingPaymentFile] FOREIGN KEY ([PremiumListingPaymentFileId]) REFERENCES [Load].[PremiumListingPaymentFile] ([Id])
);

