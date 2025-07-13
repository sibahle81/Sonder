CREATE TABLE [quote].[QuoteAllowance] (
    [QuoteAllowanceId] INT             IDENTITY (1, 1) NOT NULL,
    [QuoteId]          INT             NOT NULL,
    [AllowanceTypeId]  INT             NOT NULL,
    [Allowance]        DECIMAL (18, 2) NULL,
    CONSTRAINT [PK_QuoteAllowance] PRIMARY KEY CLUSTERED ([QuoteAllowanceId] ASC),
    CONSTRAINT [FK_AllowanceType_QuoteAllowance] FOREIGN KEY ([AllowanceTypeId]) REFERENCES [common].[AllowanceType] ([Id]),
    CONSTRAINT [FK_Quote_QuoteAllowance] FOREIGN KEY ([QuoteId]) REFERENCES [quote].[Quote] ([QuoteId])
);

