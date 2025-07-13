CREATE TABLE [product].[BenefitMedicalReportType] (
    [BenefitId]           INT NOT NULL,
    [MedicalReportTypeId] INT NOT NULL,
    CONSTRAINT [PK_product.BenefitMedicalReportType] PRIMARY KEY CLUSTERED ([BenefitId] ASC, [MedicalReportTypeId] ASC),
    CONSTRAINT [FK_BenefitMedicalReportType_MedicalReportType] FOREIGN KEY ([MedicalReportTypeId]) REFERENCES [common].[MedicalReportType] ([Id]),
    CONSTRAINT [FK_product.BenefitMedicalReportType_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit] ([Id])
);


GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'MedicalReportTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'MedicalReportTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'MedicalReportTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'MedicalReportTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'MedicalReportTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'MedicalReportTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitMedicalReportType', @level2type = N'COLUMN', @level2name = N'BenefitId';

