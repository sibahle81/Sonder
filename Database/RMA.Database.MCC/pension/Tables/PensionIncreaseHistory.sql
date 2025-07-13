CREATE TABLE [pension].[PensionIncreaseHistory] (
    [Id]                        INT          IDENTITY (1, 1) NOT NULL,
    [LedgerId]                  INT          NOT NULL,
    [IncreaseId]                INT          NOT NULL,
    [IncreasePercent]           INT          NOT NULL,
    [IncreaseAmount]            DECIMAL (18) NOT NULL,
    [PensionIncreaseAmountType] INT          NOT NULL,
    [AmountBeforeIncrease]      DECIMAL (18) NOT NULL,
    [AmountAfterIncrease]       DECIMAL (18) NOT NULL,
    [IsActive]                  BIT          NOT NULL,
    [IsDeleted]                 BIT          NOT NULL,
    [CreatedBy]                 VARCHAR (50) NOT NULL,
    [CreatedDate]               DATETIME     NOT NULL,
    [ModifiedBy]                VARCHAR (50) NOT NULL,
    [ModifiedDate]              DATETIME     NOT NULL,
    CONSTRAINT [PK_PensionIncreaseHistory] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PensionIncreaseHistory_Ledger] FOREIGN KEY ([LedgerId]) REFERENCES [pension].[Ledger] ([PensionLedgerId]),
    CONSTRAINT [FK_PensionIncreaseHistory_PensionIncrease] FOREIGN KEY ([IncreaseId]) REFERENCES [pension].[PensionIncrease] ([Id]),
    CONSTRAINT [FK_PensionIncreaseHistory_PensionIncrease1] FOREIGN KEY ([IncreaseId]) REFERENCES [pension].[PensionIncrease] ([Id])
);

