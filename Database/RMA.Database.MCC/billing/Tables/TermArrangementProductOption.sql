CREATE TABLE [billing].[TermArrangementProductOption] (
    [TermArrangementProductOptionId] INT             IDENTITY (1, 1) NOT NULL,
    [ProductOptionId]                INT             NOT NULL,
    [TermArrangementId]              INT             NOT NULL,
    [ContractAmount]                 DECIMAL (18, 2) NOT NULL,
    CONSTRAINT [PK_TermArrangementProducOption] PRIMARY KEY CLUSTERED ([TermArrangementProductOptionId] ASC),
    CONSTRAINT [FK_TermArrangementProducOption_ProductOption] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id]),
    CONSTRAINT [FK_TermArrangementProducOption_TermArrangement] FOREIGN KEY ([TermArrangementId]) REFERENCES [billing].[TermArrangement] ([TermArrangementId])
);

