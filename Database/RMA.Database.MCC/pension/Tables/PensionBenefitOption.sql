CREATE TABLE [pension].[PensionBenefitOption] (
    [Id]              INT          IDENTITY (1, 1) NOT NULL,
    [PensionTypeId]   INT          NOT NULL,
    [BenefitId]       INT          NOT NULL,
    [ProductId]       INT          NOT NULL,
    [ProductOptionId] INT          NOT NULL,
    [IsActive]        BIT          CONSTRAINT [DF_PensionBenefitOption_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]       BIT          CONSTRAINT [DF_PensionBenefitOption_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]       VARCHAR (50) NOT NULL,
    [CreatedDate]     DATETIME     CONSTRAINT [DF_PensionBenefitOption_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]      VARCHAR (50) NOT NULL,
    [ModifiedDate]    DATETIME     CONSTRAINT [DF_PensionBenefitOption_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__pension_PensionBenefitOption] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PensionBenefitOption_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit] ([Id]),
    CONSTRAINT [FK_PensionBenefitOption_PensionType] FOREIGN KEY ([PensionTypeId]) REFERENCES [common].[PensionType] ([Id]),
    CONSTRAINT [FK_PensionBenefitOption_Product] FOREIGN KEY ([ProductId]) REFERENCES [product].[Product] ([Id]),
    CONSTRAINT [FK_PensionBenefitOption_ProductOption] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id])
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'PensionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'PensionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'PensionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'PensionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'PensionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'PensionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitOption', @level2type = N'COLUMN', @level2name = N'Id';

