CREATE TABLE [finance].[RefundHeader] (
    [Id]                INT                                                IDENTITY (1, 1) NOT NULL,
    [ClientId]          INT                                                NOT NULL,
    [TotalRefundAmount] MONEY MASKED WITH (FUNCTION = 'default()')         NOT NULL,
    [IsReconciled]      BIT                                                NOT NULL,
    [IsActive]          BIT                                                NOT NULL,
    [IsDeleted]         BIT                                                NOT NULL,
    [CreatedBy]         VARCHAR (50)                                       NOT NULL,
    [CreatedDate]       DATETIME                                           NOT NULL,
    [ModifiedBy]        VARCHAR (50)                                       NOT NULL,
    [ModifiedDate]      DATETIME                                           NOT NULL,
    [Reference]         VARCHAR (50) MASKED WITH (FUNCTION = 'default()')  NULL,
    [RejectReason]      VARCHAR (50)                                       NULL,
    [StatusId]          INT                                                NULL,
    [Client]            VARCHAR (100)                                      NULL,
    [BankName]          VARCHAR (100) MASKED WITH (FUNCTION = 'default()') NULL,
    [BranchCode]        VARCHAR (100) MASKED WITH (FUNCTION = 'default()') NULL,
    [BankAccount]       VARCHAR (100) MASKED WITH (FUNCTION = 'default()') NULL,
    CONSTRAINT [PK_finance.RefundHeader] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'TotalRefundAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'TotalRefundAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'TotalRefundAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'TotalRefundAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'TotalRefundAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'TotalRefundAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'RejectReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'RejectReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'RejectReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'RejectReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'RejectReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'RejectReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsReconciled';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsReconciled';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsReconciled';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsReconciled';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsReconciled';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsReconciled';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ClientId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ClientId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ClientId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ClientId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ClientId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'ClientId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Client';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Client';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Client';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Client';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Client';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'Client';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BranchCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BranchCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BranchCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BranchCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BranchCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BranchCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankAccount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankAccount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankAccount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankAccount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankAccount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'RefundHeader', @level2type = N'COLUMN', @level2name = N'BankAccount';

