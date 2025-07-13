CREATE TABLE [pension].[LedgerRecipient]
(
    [LedgerRecipientId] INT NOT NULL IDENTITY,
    [PensionLedgerId] INT NOT NULL,
	[RolePlayerId] INT NOT NULL,
	[RolePlayerBankingId] INT NOT NULL,
	[IsActive]  BIT NOT NULL,
    [IsDeleted] BIT NOT NULL,
    [CreatedBy] VARCHAR (50) NOT NULL,
    [CreatedDate] DATETIME NOT NULL,
    [ModifiedBy]  VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME NOT NULL, 
    CONSTRAINT [PK_LedgerRecipient] PRIMARY KEY ([LedgerRecipientId]), 
    CONSTRAINT [FK_LedgerRecipient_RolePlayer] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer]([RolePlayerId]), 
    CONSTRAINT [FK_LedgerRecipient_RolePlayerBankingDetails] FOREIGN KEY ([RolePlayerBankingId]) REFERENCES [client].[RolePlayerBankingDetails]([RolePlayerBankingId]), 
    CONSTRAINT [FK_LedgerRecipient_Ledger] FOREIGN KEY ([PensionLedgerId]) REFERENCES [pension].[Ledger]([PensionLedgerId]),
)
