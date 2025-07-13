CREATE TABLE [pension].[OverpaymentBalance] (
    [OverpaymentBalanceID]     INT            IDENTITY (1, 1) NOT NULL,
    [PensionCaseID]            INT            NOT NULL,
    [OverpaymentBalanceTypeID] INT            NOT NULL,
    [entryDate]                DATETIME       NOT NULL,
    [ReceivedFrom]             VARCHAR (300)  NOT NULL,
    [ReferenceNumber]          VARCHAR (100)  NOT NULL,
    [Comment]                  VARCHAR (6000) NULL,
    [EntryStatusID]            INT            NOT NULL,
    [IsActive]                 BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]                BIT            NOT NULL,
    [CreatedBy]                VARCHAR (50)   NOT NULL,
    [CreatedDate]              DATETIME       NOT NULL,
    [ModifiedBy]               VARCHAR (50)   NOT NULL,
    [ModifiedDate]             DATETIME       NOT NULL,
    CONSTRAINT [PK_Pension_OverpaymentBalance_OverpaymentBalanceID] PRIMARY KEY CLUSTERED ([OverpaymentBalanceID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_OverpaymentBalance_EntryStatus] FOREIGN KEY ([EntryStatusID]) REFERENCES [common].[EntryStatus] ([Id]),
    CONSTRAINT [FK_OverpaymentBalance_OverpaymentBalanceType] FOREIGN KEY ([OverpaymentBalanceTypeID]) REFERENCES [common].[OverpaymentBalanceType] ([Id]),
    CONSTRAINT [FK_OverpaymentBalance_PensionCase] FOREIGN KEY ([PensionCaseID]) REFERENCES [pension].[PensionCase] ([PensionCaseId])
);

