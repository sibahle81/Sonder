CREATE TABLE [finance].[AbilityPostingAudit] (
    [Id]                    INT                                                  IDENTITY (1, 1) NOT NULL,
    [Reference]             VARCHAR (50)                                         NOT NULL,
    [PaymentId]             INT                                                  NULL,
    [SysNo]                 INT                                                  NULL,
    [IsActive]              BIT                                                  NOT NULL,
    [IsDeleted]             BIT                                                  NOT NULL,
    [CreatedBy]             VARCHAR (50)                                         NOT NULL,
    [CreatedDate]           DATETIME                                             NOT NULL,
    [ModifiedBy]            VARCHAR (50)                                         NOT NULL,
    [ModifiedDate]          DATETIME                                             NOT NULL,
    [PaymentHeaderDetailId] INT                                                  NULL,
    [PaymentReference]      VARCHAR (100)                                        NULL,
    [PaymentBatchReference] VARCHAR (100)                                        NULL,
    [Amount]                DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NULL,
    [PayeeDetails]          VARCHAR (100) MASKED WITH (FUNCTION = 'default()')   NULL,
    [Bank]                  VARCHAR (100) MASKED WITH (FUNCTION = 'default()')   NULL,
    [BankBranch]            VARCHAR (100)                                        NULL,
    [AccountDetails]        VARCHAR (100) MASKED WITH (FUNCTION = 'default()')   NULL,
    [PaymentTypeId]         INT                                                  NULL,
    [IsProcessed]           BIT                                                  NULL,
    [BrokerageId]           INT                                                  NULL,
    CONSTRAINT [PK_finance.AbilityPostingAudit] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_AbilityPostingAudit_BrokerPartnership] FOREIGN KEY ([BrokerageId]) REFERENCES [broker].[BrokerPartnership] ([BrokerageId])
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'SysNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'SysNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'SysNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'SysNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'SysNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'SysNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentHeaderDetailId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentHeaderDetailId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentHeaderDetailId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentHeaderDetailId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentHeaderDetailId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentHeaderDetailId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentBatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentBatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentBatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentBatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentBatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PaymentBatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PayeeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PayeeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PayeeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PayeeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PayeeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'PayeeDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'AccountDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'AccountDetails';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'AccountDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'AccountDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'AccountDetails';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'AbilityPostingAudit', @level2type = N'COLUMN', @level2name = N'AccountDetails';

