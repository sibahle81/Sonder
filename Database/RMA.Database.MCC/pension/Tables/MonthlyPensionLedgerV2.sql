CREATE TABLE [pension].[MonthlyPensionLedgerV2]
(
	[MonthlyPensionLedgerId] INT NOT NULL IDENTITY, 
    [MonthlyPensionId] INT NOT NULL, 
    [PensionLedgerId] INT NOT NULL,
    [PaymentTypeId] INT NOT NULL, 
    [PaymentItemId] INT NULL, 
    [Amount] NUMERIC(9, 2) NOT NULL, 
    [PAYE] NUMERIC(9, 2) NOT NULL DEFAULT 0, 
    [AdditionalTax] NUMERIC(9, 2) NOT NULL DEFAULT 0, 
    [BeneficiaryId] INT NOT NULL, 
    [RolePlayerBankingId] INT NULL,
    [PensionIncreaseId] INT NULL,
    [MonthEndReleaseId] INT NULL,
    [PensionLedgerPaymentStatusId] INT NOT NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0, 
    [CreatedBy] VARCHAR(50) NOT NULL, 
    [CreatedDate] DATETIME NOT NULL, 
    [ModifiedBy] VARCHAR(50) NOT NULL, 
    [ModifiedDate] DATETIME NOT NULL
    CONSTRAINT [PK_MonthlyPensionLedgerV2] PRIMARY KEY ([MonthlyPensionLedgerId]),   
    CONSTRAINT [FK_MonthlyPensionLedgerV2_MonthlyPensionV2] FOREIGN KEY ([MonthlyPensionId]) REFERENCES [pension].[MonthlyPensionV2](MonthlyPensionId), 
    CONSTRAINT [FK_MonthlyPensionLedgerV2_Ledger] FOREIGN KEY ([PensionLedgerId]) REFERENCES [pension].[Ledger](PensionLedgerId), 
    CONSTRAINT [FK_MonthlyPensionLedgerV2_PaymentType] FOREIGN KEY ([PaymentTypeId]) REFERENCES [common].[PaymentType](Id), 
    CONSTRAINT [FK_MonthlyPensionLedgerV2_PensionIncrease] FOREIGN KEY ([PensionIncreaseId]) REFERENCES [pension].[PensionIncrease]([Id]), 
    CONSTRAINT [FK_MonthlyPensionLedgerV2_PensionLedgerPaymentStatus] FOREIGN KEY ([PensionLedgerPaymentStatusId]) REFERENCES [common].[PensionLedgerPaymentStatus]([Id]), 
    CONSTRAINT [FK_MonthlyPensionLedgerV2_MonthEndRunRelease] FOREIGN KEY ([MonthEndReleaseId]) REFERENCES [pension].[MonthEndRunRelease]([MonthEndReleaseId]),
)

GO

CREATE INDEX [IX_MonthlyPensionLedgerV2_PaymentTypeIdItemId] ON [pension].[MonthlyPensionLedgerV2] (PaymentTypeId, PaymentItemId)
