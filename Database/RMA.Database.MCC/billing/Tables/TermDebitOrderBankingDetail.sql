CREATE TABLE [billing].[TermDebitOrderBankingDetail] (
    [TermDebitOrderBankingDetailId] INT           IDENTITY (1, 1) NOT NULL,
    [TermArrangementId]             INT           NOT NULL,
    [BankId]                        INT           NOT NULL,
    [BankBranchId]                  INT           NULL,
    [BankAccountHolder]             VARCHAR (500) NULL,
    [BankBranchCode]                VARCHAR (50)  NULL,
    [BankAccountNumber]             VARCHAR (100) NOT NULL,
    [BankAccountTypeId]             INT           NOT NULL,
    [IsDeleted]                     BIT           NOT NULL,
    [CreatedBy]                     VARCHAR (50)  NOT NULL,
    [CreatedDate]                   DATETIME      NOT NULL,
    [ModifiedBy]                    VARCHAR (50)  NOT NULL,
    [ModifiedDate]                  DATETIME      NOT NULL,
    CONSTRAINT [PK_TermDebitOrderBankingDetail] PRIMARY KEY CLUSTERED ([TermDebitOrderBankingDetailId] ASC),
    CONSTRAINT [FK_TermDebitOrderBankingDetail_Bank] FOREIGN KEY ([BankId]) REFERENCES [common].[Bank] ([Id]),
    CONSTRAINT [FK_TermDebitOrderBankingDetail_BankAccountType] FOREIGN KEY ([BankAccountTypeId]) REFERENCES [common].[BankAccountType] ([Id]),
    CONSTRAINT [FK_TermDebitOrderBankingDetail_TermArrangement] FOREIGN KEY ([TermArrangementId]) REFERENCES [billing].[TermArrangement] ([TermArrangementId])
);

