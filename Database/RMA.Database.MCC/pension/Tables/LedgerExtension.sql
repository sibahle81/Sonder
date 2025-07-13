CREATE TABLE [pension].[LedgerExtension] (
    [ExtensionId]             INT          IDENTITY (1, 1) NOT NULL,
    [LedgerId]                INT          NOT NULL,
    [RequestedBy]             INT          NOT NULL,
    [DateRequested]           DATETIME     NOT NULL,
    [EffectiveDate]           DATETIME     NOT NULL,
    [EndDate]                 DATETIME     NOT NULL,
    [ExtensionStatusId]       INT          NOT NULL,
    [ExtensionRejectReasonId] INT          NULL,
    [Notes]                   VARCHAR (50) NULL,
    [IsDeleted]               BIT          NOT NULL,
    [CreatedBy]               VARCHAR (50) NOT NULL,
    [CreatedDate]             DATETIME     CONSTRAINT [DF_pension.LedgerExtension_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]              VARCHAR (50) NOT NULL,
    [ModifiedDate]            DATETIME     CONSTRAINT [DF_pension.LedgerExtension_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_pension.LedgerExtension] PRIMARY KEY CLUSTERED ([ExtensionId] ASC),
    CONSTRAINT [FK_LedgerExtension_Ledger] FOREIGN KEY ([LedgerId]) REFERENCES [pension].[Ledger] ([PensionLedgerId]),
    CONSTRAINT [FK_LedgerExtension_LedgerExtensionRejectReason] FOREIGN KEY ([ExtensionRejectReasonId]) REFERENCES [common].[LedgerExtensionRejectReason] ([Id]),
    CONSTRAINT [FK_LedgerExtension_LedgerExtensionStatus] FOREIGN KEY ([ExtensionStatusId]) REFERENCES [common].[LedgerExtensionStatus] ([Id])
);



