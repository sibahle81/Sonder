CREATE TABLE [billing].[AutoAllocationBankAccount] (
    [AutoAllocationBankAccountId] INT          IDENTITY (1, 1) NOT NULL,
    [BankAccountId]               INT          NOT NULL,
    [CreatedBy]                   VARCHAR (50) NOT NULL,
    [CreatedDate]                 DATETIME     NOT NULL,
    [ModifiedBy]                  VARCHAR (50) NOT NULL,
    [ModifiedDate]                DATETIME     NOT NULL,
    [IsDeleted]                   BIT          NOT NULL,
    CONSTRAINT [PK_DebtorAutoAllocationBankAccount] PRIMARY KEY CLUSTERED ([AutoAllocationBankAccountId] ASC),
    CONSTRAINT [FK_AutoAllocationBankAccount_BankAccount] FOREIGN KEY ([BankAccountId]) REFERENCES [common].[BankAccount] ([Id])
);

