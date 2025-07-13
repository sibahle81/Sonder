CREATE TABLE [product].[ProductOption] (
    [Id]                         INT            IDENTITY (1, 1) NOT NULL,
    [ProductId]                  INT            NOT NULL,
    [Name]                       VARCHAR (100)  NULL,
    [Description]                VARCHAR (255)  NULL,
    [StartDate]                  DATE           NOT NULL,
    [EndDate]                    DATETIME       NULL,
    [IsDeleted]                  BIT            NOT NULL,
    [CreatedBy]                  VARCHAR (50)   NOT NULL,
    [CreatedDate]                DATETIME       NOT NULL,
    [ModifiedBy]                 VARCHAR (50)   NOT NULL,
    [ModifiedDate]               DATETIME       NOT NULL,
    [MaxAdminFeePercentage]      DECIMAL (6, 3) CONSTRAINT [df_MaxAdminFeePercentage] DEFAULT ((0.30)) NOT NULL,
    [MaxCommissionFeePercentage] DECIMAL (6, 3) CONSTRAINT [df_MaxCommissionFeePercentage] DEFAULT ((0.225)) NOT NULL,
    [MaxBinderFeePercentage]     DECIMAL (6, 3) CONSTRAINT [DF_ProductOption_MaxBinderFeePercentage] DEFAULT ((0.00)) NOT NULL,
    [Code]                       VARCHAR (50)   NOT NULL,
    [ProductTypeId]              INT            NULL,
    [IsTaxabled]                 BIT            NULL,
    [CommissionScale]            VARCHAR (50)   NULL,
    [BaseRate]                   DECIMAL (6, 3) NULL,
    [CoverTypeId]                INT            NOT NULL,
    [CoverOptionTypeId]          INT            NULL,
    [GroupCoverAmountOptionId]   INT            NULL,
    CONSTRAINT [PK_product.ProductOption] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_product.ProductOption_Product] FOREIGN KEY ([ProductId]) REFERENCES [product].[Product] ([Id]),
    CONSTRAINT [FK_ProductOption_GroupCoverAmountOption] FOREIGN KEY ([GroupCoverAmountOptionId]) REFERENCES [common].[GroupCoverAmountOption] ([Id]),
    CONSTRAINT [FK_ProductOptionCoverType_CoverType] FOREIGN KEY ([CoverTypeId]) REFERENCES [common].[CoverType] ([Id])
);










GO


GO


GO


GO


GO


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ProductId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxCommissionFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxCommissionFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxCommissionFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxCommissionFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxCommissionFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxCommissionFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxBinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxBinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxBinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxBinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxBinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxBinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxAdminFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxAdminFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxAdminFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxAdminFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxAdminFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'MaxAdminFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'isTaxabled';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'isTaxabled';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'isTaxabled';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'isTaxabled';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'isTaxabled';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'isTaxabled';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO



GO



GO



GO



GO



GO



GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CommissionScale';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CommissionScale';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CommissionScale';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CommissionScale';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CommissionScale';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'CommissionScale';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'ProductOption', @level2type = N'COLUMN', @level2name = N'Code';

