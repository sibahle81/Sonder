CREATE TABLE [product].[ProductBankAccount] (
    [ProductId]       INT NOT NULL,
    [BankAccountId]   INT NOT NULL,
    [IndustryClassId] INT NOT NULL,
    CONSTRAINT [PK_product.ProductBankAccount] PRIMARY KEY CLUSTERED ([ProductId] ASC, [BankAccountId] ASC, [IndustryClassId] ASC),
    CONSTRAINT [FK_product.ProductBankAccount_IndustryClass] FOREIGN KEY ([IndustryClassId]) REFERENCES [common].[IndustryClass] ([Id]),
    CONSTRAINT [FK_product.ProductBankAccount_Product] FOREIGN KEY ([ProductId]) REFERENCES [product].[Product] ([Id]),
    CONSTRAINT [FK_ProductBankAccount_BankAccount] FOREIGN KEY ([BankAccountId]) REFERENCES [common].[BankAccount] ([Id])
);


GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'IndustryClassId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'BankAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'BankAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'BankAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'BankAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'BankAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductBankAccount', @level2type = N'COLUMN', @level2name = N'BankAccountId';

