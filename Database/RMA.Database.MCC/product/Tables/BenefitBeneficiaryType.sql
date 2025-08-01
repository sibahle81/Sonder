CREATE TABLE [product].[BenefitBeneficiaryType] (
    [BenefitId]         INT NOT NULL,
    [BeneficiaryTypeId] INT NOT NULL,
    CONSTRAINT [PK_product.BenefitBeneficiaryType] PRIMARY KEY CLUSTERED ([BenefitId] ASC, [BeneficiaryTypeId] ASC),
    CONSTRAINT [FK_BenefitBeneficiaryType_BeneficiaryType] FOREIGN KEY ([BeneficiaryTypeId]) REFERENCES [common].[BeneficiaryType] ([Id]),
    CONSTRAINT [FK_BenefitBeneficiaryType_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit] ([Id])
);


GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitBeneficiaryType', @level2type = N'COLUMN', @level2name = N'BeneficiaryTypeId';

