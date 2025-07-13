CREATE TABLE [product].[BenefitRate] (
    [Id]            INT              IDENTITY (1, 1) NOT NULL,
    [BenefitId]     INT              NOT NULL,
    [BaseRate]      DECIMAL (18, 10) NOT NULL,
    [EffectiveDate] DATE             NOT NULL,
    [BenefitAmount] DECIMAL (18, 2)  NOT NULL,
    [IsDeleted]     BIT              NOT NULL,
    [CreatedBy]     VARCHAR (50)     NOT NULL,
    [CreatedDate]   DATETIME         NOT NULL,
    [ModifiedBy]    VARCHAR (50)     NOT NULL,
    [ModifiedDate]  DATETIME         NOT NULL,
    CONSTRAINT [PK_BenefitRate] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_BenefitRate_Benefit] FOREIGN KEY ([BenefitId]) REFERENCES [product].[Benefit] ([Id])
);








GO

GO

GO
CREATE NONCLUSTERED INDEX [BenefitRate_IsDeleted_Includes_BenefitId_BaseRate_EffectiveDate]
    ON [product].[BenefitRate]([IsDeleted] ASC)
    INCLUDE([BenefitId], [BaseRate], [EffectiveDate]);


GO
CREATE NONCLUSTERED INDEX [BenefitRate_IsDeleted]
    ON [product].[BenefitRate]([IsDeleted] ASC)
    INCLUDE([BenefitId], [EffectiveDate], [BenefitAmount]);


GO
CREATE NONCLUSTERED INDEX [BenefitRate_BenefitId_IsDeleted]
    ON [product].[BenefitRate]([BenefitId] ASC, [IsDeleted] ASC)
    INCLUDE([BenefitAmount]);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'EffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BenefitAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BaseRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BaseRate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BaseRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BaseRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BaseRate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'product', @level1type = N'TABLE', @level1name = N'BenefitRate', @level2type = N'COLUMN', @level2name = N'BaseRate';

