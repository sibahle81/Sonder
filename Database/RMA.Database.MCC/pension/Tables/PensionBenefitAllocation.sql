CREATE TABLE [pension].[PensionBenefitAllocation] (
    [PensionBenefitAllocationId] INT          IDENTITY (1, 1) NOT NULL,
    [IsActive]                   BIT          CONSTRAINT [DF_PensionBenefitAllocation_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]                  BIT          CONSTRAINT [DF_PensionBenefitAllocation_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                  VARCHAR (50) NOT NULL,
    [CreatedDate]                DATETIME     CONSTRAINT [DF_PensionBenefitAllocation_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                 VARCHAR (50) NOT NULL,
    [ModifiedDate]               DATETIME     CONSTRAINT [DF_PensionBenefitAllocation_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__pension_PensionBenefitAllocation] PRIMARY KEY CLUSTERED ([PensionBenefitAllocationId] ASC)
);






GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'PensionBenefitAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'PensionBenefitAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'PensionBenefitAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'PensionBenefitAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'PensionBenefitAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'PensionBenefitAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'pension', @level1type = N'TABLE', @level1name = N'PensionBenefitAllocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';

