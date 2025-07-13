CREATE TABLE [finance].[ProductCrossRefTranType] (
    [Id]                             INT           IDENTITY (1, 1) NOT NULL,
    [ProductCodeId]                  INT           NOT NULL,
    [Origin]                         VARCHAR (250) NULL,
    [CompanyNo]                      INT           NOT NULL,
    [BranchNo]                       INT           NOT NULL,
    [TransactionType]                VARCHAR (50)  NOT NULL,
    [Level1]                         VARCHAR (50)  NOT NULL,
    [Level2]                         VARCHAR (50)  NOT NULL,
    [Level3]                         VARCHAR (50)  NOT NULL,
    [ChartISNo]                      INT           NULL,
    [ChartISName]                    VARCHAR (100) NOT NULL,
    [ChartBSNo]                      INT           NULL,
    [ChartBSName]                    VARCHAR (100) NOT NULL,
    [Benefitcode]                    VARCHAR (50)  NULL,
    [IsActive]                       BIT           NOT NULL,
    [IsDeleted]                      BIT           NOT NULL,
    [CreatedBy]                      VARCHAR (50)  NOT NULL,
    [CreatedDate]                    DATETIME      NOT NULL,
    [ModifiedBy]                     VARCHAR (50)  NOT NULL,
    [ModifiedDate]                   DATETIME      NOT NULL,
    [AbilityCollectionChartPrefixId] INT           NULL,
    CONSTRAINT [PK_finance.ProductCrossRefTranType] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_ProductCrossRefTranType_AbilityCollectionChartPrefix] FOREIGN KEY ([AbilityCollectionChartPrefixId]) REFERENCES [common].[AbilityCollectionChartPrefix] ([Id])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ProductCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ProductCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ProductCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ProductCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ProductCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ProductCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Origin';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Origin';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Origin';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Origin';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Origin';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Origin';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level3';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level3';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level3';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level3';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level3';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level3';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Level1';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CompanyNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CompanyNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CompanyNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CompanyNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CompanyNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'CompanyNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartISName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'ChartBSName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'BranchNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'BranchNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'BranchNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'BranchNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'BranchNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'BranchNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Benefitcode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Benefitcode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Benefitcode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Benefitcode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Benefitcode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'ProductCrossRefTranType', @level2type = N'COLUMN', @level2name = N'Benefitcode';

