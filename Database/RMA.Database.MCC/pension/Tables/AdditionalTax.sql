CREATE TABLE [pension].[AdditionalTax] (
    [Id]                  INT          NOT NULL,
    [LedgerId]            INT          NOT NULL,
    [AdditionalTaxTypeId] INT          IDENTITY (1, 1) NOT NULL,
    [DateReceived]        DATETIME     NOT NULL,
    [StartDate]           DATETIME     NOT NULL,
    [EndDate]             DATETIME     NOT NULL,
    [Amount]              DECIMAL (18) NOT NULL,
    [PersonId]            INT          NOT NULL,
    [IsActive]            BIT          CONSTRAINT [DF_AdditionalTax_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]           BIT          CONSTRAINT [DF_AdditionalTax_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]           VARCHAR (50) NOT NULL,
    [CreatedDate]         DATETIME     NOT NULL,
    [ModifiedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]        DATETIME     NOT NULL,
    CONSTRAINT [PK_AdditionalTax] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_AdditionalTax_AdditionalTaxType] FOREIGN KEY ([AdditionalTaxTypeId]) REFERENCES [common].[AdditionalTaxType] ([Id]),
    CONSTRAINT [FK_AdditionalTax_Ledger] FOREIGN KEY ([LedgerId]) REFERENCES [pension].[Ledger] ([PensionLedgerId]),
    CONSTRAINT [FK_AdditionalTax_Person] FOREIGN KEY ([PersonId]) REFERENCES [client].[Person] ([RolePlayerId])
);

