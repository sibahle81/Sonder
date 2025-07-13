CREATE TABLE [product].[ProductOptionDependency] (
    [ProductOptionDependencyId]    INT             IDENTITY (1, 1) NOT NULL,
    [ProductOptionId]              INT             NULL,
    [ChildOptionId]                INT             NOT NULL,
    [IndustryClassId]              INT             NOT NULL,
    [ChildPremiumPecentage]        DECIMAL (18, 2) NOT NULL,
    [QuoteAutoAcceptParentAccount] BIT             NOT NULL,
    PRIMARY KEY CLUSTERED ([ProductOptionDependencyId] ASC),
    CONSTRAINT [FK_ProductOptionDependency_ProductOption] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id])
);

