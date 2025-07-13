CREATE TABLE [product].[ProductOptionAllowanceType] (
    [ProductOptionAllowanceTypeId] INT IDENTITY (1, 1) NOT NULL,
    [ProductOptionId]              INT NULL,
    [AllowanceTypeId]              INT NULL,
    [IndustryClassId]              INT NULL,
    CONSTRAINT [PK_ProductOptionAllowanceType] PRIMARY KEY CLUSTERED ([ProductOptionAllowanceTypeId] ASC),
    CONSTRAINT [FK_ProductOption_ProductOptionAllowanceType] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id])
);

