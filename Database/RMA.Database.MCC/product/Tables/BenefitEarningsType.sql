CREATE TABLE [product].[BenefitEarningsType] (
    [BenefitId]      INT NOT NULL,
    [EarningsTypeId] INT NOT NULL,
    CONSTRAINT [PK_product.BenefitEarningsType] PRIMARY KEY CLUSTERED ([BenefitId] ASC, [EarningsTypeId] ASC),
    CONSTRAINT [FK_BenefitEarningsType_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit] ([Id]),
    CONSTRAINT [FK_BenefitEarningsType_EarningsType] FOREIGN KEY ([EarningsTypeId]) REFERENCES [common].[EarningsType] ([Id])
);


GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'EarningsTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'EarningsTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'EarningsTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'EarningsTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'EarningsTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'EarningsTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitEarningsType', @level2type = N'COLUMN', @level2name = N'BenefitId';

