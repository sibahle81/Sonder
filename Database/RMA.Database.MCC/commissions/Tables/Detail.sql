CREATE TABLE [commission].[Detail] (
    [DetailId]                   INT                                                  IDENTITY (1, 1) NOT NULL,
    [HeaderId]                   INT                                                  NOT NULL,
    [InvoicePaymentAllocationId] INT                                                  NOT NULL,
    [InvoiceNumber]              VARCHAR (50)                                         NULL,
    [PolicyNumber]               VARCHAR (50)                                         NULL,
    [RepCode]                    VARCHAR (20)                                         NULL,
    [RepName]                    VARCHAR (200)                                        NULL,
    [AllocatedAmount]            DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [CommissionPercentage]       FLOAT (53)                                           NOT NULL,
    [AdminPercentage]            FLOAT (53)                                           NOT NULL,
    [CommissionFormula]          VARCHAR (500)                                        NOT NULL,
    [CommissionAmount]           DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [AdminServiceFeeFormula]     VARCHAR (500)                                        NOT NULL,
    [AdminServiceFeeAmount]      DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [TotalAmount]                DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [IsDeleted]                  BIT                                                  CONSTRAINT [DF_Detail_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                  VARCHAR (50)                                         NOT NULL,
    [CreatedDate]                DATETIME                                             DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                 VARCHAR (50)                                         NOT NULL,
    [ModifiedDate]               DATETIME                                             DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Detail] PRIMARY KEY CLUSTERED ([DetailId] ASC),
    CONSTRAINT [FK_Detail_Header] FOREIGN KEY ([HeaderId]) REFERENCES [commission].[Header] ([HeaderId]),
    CONSTRAINT [FK_Detail_InvoicePaymentAllocation] FOREIGN KEY ([InvoicePaymentAllocationId]) REFERENCES [commission].[InvoicePaymentAllocation] ([InvoicePaymentAllocationId])
);


GO

GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'RepCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoicePaymentAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoicePaymentAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoicePaymentAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoicePaymentAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoicePaymentAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoicePaymentAllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'InvoiceNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'DetailId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'DetailId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'DetailId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'DetailId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'DetailId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'DetailId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionFormula';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionFormula';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionFormula';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionFormula';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionFormula';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionFormula';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'CommissionAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AllocatedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AllocatedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AllocatedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AllocatedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AllocatedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AllocatedAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeFormula';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeFormula';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeFormula';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeFormula';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeFormula';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeFormula';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminServiceFeeAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Detail', @level2type = N'COLUMN', @level2name = N'AdminPercentage';

