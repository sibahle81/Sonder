CREATE TABLE [product].[ProductOptionCoverType] (
    [ProductOptionId] INT NOT NULL,
    [CoverTypeId]     INT NOT NULL,
    CONSTRAINT [PK_ProductOptionCoverType] PRIMARY KEY CLUSTERED ([ProductOptionId] ASC, [CoverTypeId] ASC),
    CONSTRAINT [FK_ProductOptionCoverType__CoverType] FOREIGN KEY ([CoverTypeId]) REFERENCES [common].[CoverType] ([Id]),
    CONSTRAINT [FK_ProductOptionCoverType__ProductOption] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id]),
    CONSTRAINT [FK_ProductOptionCoverType_ProductOption] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id]),
    CONSTRAINT [UK_ProductOptionCoverType_ProductOption] UNIQUE NONCLUSTERED ([ProductOptionId] ASC)
);




GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'CoverTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'CoverTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'CoverTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'CoverTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'CoverTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOptionCoverType', @level2type = N'COLUMN', @level2name = N'CoverTypeId';

