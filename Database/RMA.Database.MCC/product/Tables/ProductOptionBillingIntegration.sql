CREATE TABLE [product].[ProductOptionBillingIntegration] (
    [ProductOptionBillingIntegrationId] INT IDENTITY (1, 1) NOT NULL,
    [ProductOptionId]                   INT NULL,
    [IndustryClassId]                   INT NULL,
    [AllowTermsArrangement]             BIT NULL,
    [AccumulatesInterest]               BIT NULL,
    CONSTRAINT [PK_ProductOptionBillingIntegration] PRIMARY KEY CLUSTERED ([ProductOptionBillingIntegrationId] ASC),
    CONSTRAINT [FK_ProductOptionBillingIntegration_ProductOption] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id])
);

