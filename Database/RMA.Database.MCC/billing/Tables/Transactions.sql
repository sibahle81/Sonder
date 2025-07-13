CREATE TABLE [billing].[Transactions] (
    [TransactionId]               INT             IDENTITY (1, 1) NOT NULL,
    [InvoiceId]                   INT             NULL,
    [RolePlayerId]                INT             NOT NULL,
    [BankStatementEntryId]        INT             NULL,
    [TransactionTypeLinkId]       INT             NOT NULL,
    [Amount]                      DECIMAL (18, 2) NOT NULL,
    [TransactionDate]             DATETIME        NOT NULL,
    [BankReference]               VARCHAR (50)    NULL,
    [TransactionTypeId]           INT             NOT NULL,
    [Reason]                      VARCHAR (255)   NULL,
    [RmaReference]                VARCHAR (100)   NULL,
    [LinkedTransactionId]         INT             NULL,
    [ClaimRecoveryInvoiceId]      INT             NULL,
    [IsLogged]                    BIT             NULL,
    [AdhocPaymentInstructionId]   INT             NULL,
    [IsReAllocation]              BIT             NULL,
    [Balance]                     DECIMAL (18, 2) NULL,
    [PremiumListingTransactionId] INT             NULL,
    [DeletedReasonId]             INT             NULL,
    [IsDeleted]                   BIT             CONSTRAINT [DF__Transacti__IsDel__0571F9C6] DEFAULT ((0)) NOT NULL,
    [CreatedDate]                 DATETIME        CONSTRAINT [DF_Transactions_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]                   VARCHAR (50)    NOT NULL,
    [ModifiedBy]                  VARCHAR (50)    NOT NULL,
    [ModifiedDate]                DATETIME        CONSTRAINT [DF_Transactions_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    [TransactionReasonId]         INT             NULL,
    [IsBackDated]                 BIT             CONSTRAINT [DF_Transactions_IsBackDated] DEFAULT ((0)) NULL,
    [TransactionEffectiveDate]    DATETIME        NULL,
    [PeriodId]                    INT             NULL,
    CONSTRAINT [PK_Transactions] PRIMARY KEY CLUSTERED ([TransactionId] ASC),
    CONSTRAINT [FK_Transaction_BankStatementEntry] FOREIGN KEY ([BankStatementEntryId]) REFERENCES [finance].[BankStatementEntry] ([BankStatementEntryId]),
    CONSTRAINT [FK_Transactions_AdhocPaymentInstructions] FOREIGN KEY ([AdhocPaymentInstructionId]) REFERENCES [billing].[AdhocPaymentInstructions] ([AdhocPaymentInstructionId]),
    CONSTRAINT [FK_Transactions_ClaimRecovery] FOREIGN KEY ([ClaimRecoveryInvoiceId]) REFERENCES [billing].[ClaimRecoveryInvoice] ([ClaimRecoveryInvoiceId]),
    CONSTRAINT [FK_Transactions_DeletedReason] FOREIGN KEY ([DeletedReasonId]) REFERENCES [common].[DeletedReason] ([Id]),
    CONSTRAINT [FK_Transactions_FinPayee] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[FinPayee] ([RolePlayerId]),
    CONSTRAINT [FK_Transactions_Invoice] FOREIGN KEY ([InvoiceId]) REFERENCES [billing].[Invoice] ([InvoiceId]),
    CONSTRAINT [FK_Transactions_TransactionReason] FOREIGN KEY ([TransactionReasonId]) REFERENCES [common].[TransactionReason] ([Id]),
    CONSTRAINT [FK_Transactions_Transactions] FOREIGN KEY ([LinkedTransactionId]) REFERENCES [billing].[Transactions] ([TransactionId]),
    CONSTRAINT [FK_Transactions_TransactionType] FOREIGN KEY ([TransactionTypeLinkId]) REFERENCES [billing].[TransactionTypeLink] ([Id]),
    CONSTRAINT [FK_Transactions_TransactionType1] FOREIGN KEY ([TransactionTypeId]) REFERENCES [common].[TransactionType] ([Id])
);




















GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO
CREATE NONCLUSTERED INDEX [Transactions_LinkedTransaction]
    ON [billing].[Transactions]([LinkedTransactionId] ASC, [TransactionTypeId] ASC);


GO
CREATE NONCLUSTERED INDEX [Transaction_TransactionType]
    ON [billing].[Transactions]([TransactionTypeId] ASC)
    INCLUDE([LinkedTransactionId]);


GO
CREATE NONCLUSTERED INDEX [Transaction_Balance]
    ON [billing].[Transactions]([Balance] ASC, [TransactionTypeId] ASC)
    INCLUDE([InvoiceId], [RolePlayerId], [BankStatementEntryId], [TransactionTypeLinkId], [Amount], [TransactionDate], [BankReference], [CreatedDate], [ModifiedDate], [CreatedBy], [ModifiedBy], [Reason], [RmaReference], [LinkedTransactionId], [ClaimRecoveryInvoiceId], [IsLogged], [AdhocPaymentInstructionId], [IsReAllocation]);


GO
CREATE NONCLUSTERED INDEX [Billing_Transactions_TransactionTypeId_CreatedDate]
    ON [billing].[Transactions]([TransactionTypeId] ASC, [CreatedDate] ASC)
    INCLUDE([RolePlayerId], [TransactionTypeLinkId], [Amount], [TransactionDate]);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeLinkId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeLinkId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeLinkId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeLinkId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeLinkId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeLinkId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RmaReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RmaReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RmaReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RmaReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RmaReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'RmaReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'LinkedTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'LinkedTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'LinkedTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'LinkedTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'LinkedTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'LinkedTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsReAllocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsReAllocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsReAllocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsReAllocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsReAllocation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsReAllocation';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsLogged';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsLogged';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsLogged';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsLogged';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsLogged';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsLogged';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ClaimRecoveryInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ClaimRecoveryInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ClaimRecoveryInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ClaimRecoveryInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ClaimRecoveryInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'ClaimRecoveryInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'BankReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'AdhocPaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'AdhocPaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'AdhocPaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'AdhocPaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'AdhocPaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'AdhocPaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'DeletedReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'DeletedReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'DeletedReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'DeletedReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'DeletedReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'Transactions', @level2type = N'COLUMN', @level2name = N'DeletedReasonId';


GO
CREATE NONCLUSTERED INDEX [IX_Transactions_RolePlayerId]
    ON [billing].[Transactions]([RolePlayerId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Transactions_InvoiceId_TransactionTypeId_IsDeleted]
    ON [billing].[Transactions]([InvoiceId] ASC, [TransactionTypeId] ASC, [IsDeleted] ASC);

