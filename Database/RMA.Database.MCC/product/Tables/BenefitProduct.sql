CREATE TABLE [product].[BenefitProduct] (
    [Id]        INT IDENTITY (1, 1) NOT NULL,
    [BenefitId] INT NOT NULL,
    [ProductId] INT NOT NULL,
    CONSTRAINT [PK_product.BenefitProductSet] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_BenefitProduct_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit] ([Id]),
    CONSTRAINT [FK_BenefitProduct_Product] FOREIGN KEY ([ProductId]) REFERENCES [product].[Product] ([Id])
);

