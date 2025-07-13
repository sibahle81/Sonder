CREATE TABLE [payment].[FacsTransactionResults] (
    [Id]                  INT          IDENTITY (1, 1) NOT NULL,
    [IsActive]            BIT          NOT NULL,
    [IsDeleted]           BIT          NOT NULL,
    [CreatedBy]           VARCHAR (50) NOT NULL,
    [CreatedDate]         DATETIME     NOT NULL,
    [ModifiedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]        DATETIME     NOT NULL,
    [CanEdit]             BIT          CONSTRAINT [DF__FacsTrans__CanEd__3592E0D8] DEFAULT ((1)) NOT NULL,
    [PaymentId]           INT          NULL,
    [TransactionType]     VARCHAR (5)  NOT NULL,
    [DocumentType]        VARCHAR (2)  NOT NULL,
    [Reference1]          VARCHAR (2)  NULL,
    [Reference2]          VARCHAR (20) NOT NULL,
    [Amount]              VARCHAR (11) NOT NULL,
    [ActionDate]          VARCHAR (10) NOT NULL,
    [RequisitionNumber ]  VARCHAR (9)  NULL,
    [DocumentNumber]      VARCHAR (8)  NULL,
    [AgencyPrefix]        VARCHAR (1)  NULL,
    [AgencyNumber]        VARCHAR (6)  NULL,
    [DepositType]         VARCHAR (2)  NULL,
    [ChequeClearanceCode] VARCHAR (10) NULL,
    [ChequeNumber]        VARCHAR (9)  NULL,
    [BankAccountNumber]   VARCHAR (17) NOT NULL,
    [UniqueUserCode]      VARCHAR (4)  NULL,
    [CollectionId]        INT          NULL,
    CONSTRAINT [PK_payment.FacsTransactionResults] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_FacsTransactionResults_Collections] FOREIGN KEY ([CollectionId]) REFERENCES [billing].[Collections] ([CollectionsId]),
    CONSTRAINT [FK_Payment_PaymentId] FOREIGN KEY ([PaymentId]) REFERENCES [payment].[Payment] ([PaymentId])
);






GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Reference1';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DocumentNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DepositType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DepositType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DepositType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DepositType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DepositType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'DepositType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CollectionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CollectionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CollectionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CollectionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CollectionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CollectionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeClearanceCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeClearanceCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeClearanceCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeClearanceCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeClearanceCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ChequeClearanceCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyPrefix';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyPrefix';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyPrefix';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyPrefix';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyPrefix';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyPrefix';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'AgencyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ActionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ActionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ActionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ActionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ActionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'FacsTransactionResults', @level2type = N'COLUMN', @level2name = N'ActionDate';

