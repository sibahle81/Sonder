CREATE TABLE [pension].[CVPayment] (
    [CVPaymentID]                 INT                                        IDENTITY (1, 1) NOT NULL,
    [PensionLedgerID]             INT                                        NOT NULL,
    [CVAmount]                    MONEY MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [CreatedDate]                 DATETIME                                   NOT NULL,
    [ReversalReason]              VARCHAR (255)                              NULL,
    [LastChangedBy]               VARCHAR (30)                               NOT NULL,
    [LastChangedDate]             DATETIME                                   NOT NULL,
    [CVPaymentStatusID]           INT                                        NOT NULL,
    [BeneficiaryPensionInvoiceID] INT                                        NULL,
    CONSTRAINT [PK_Pension_CVPayment_CVPaymentID] PRIMARY KEY CLUSTERED ([CVPaymentID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_CVPayment_Ledger] FOREIGN KEY ([PensionLedgerID]) REFERENCES [pension].[Ledger] ([PensionLedgerId])
);

