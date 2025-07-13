CREATE TABLE [finance].[BankStatementEntry] (
    [BankStatementEntryId]      INT              IDENTITY (1, 1) NOT NULL,
    [BankStatementEntryTypeId]  INT              CONSTRAINT [DF_BankStatementEntry_BankStatementEntryTypeId] DEFAULT ((1)) NULL,
    [IsActive]                  BIT              NOT NULL,
    [IsDeleted]                 BIT              NOT NULL,
    [CreatedBy]                 VARCHAR (50)     NOT NULL,
    [CreatedDate]               DATETIME         NOT NULL,
    [ModifiedBy]                VARCHAR (50)     NOT NULL,
    [ModifiedDate]              DATETIME         NOT NULL,
    [CanEdit]                   BIT              CONSTRAINT [DF__BankState__CanEd__271082AE] DEFAULT ((1)) NOT NULL,
    [TransactionType]           VARCHAR (5)      NOT NULL,
    [DocumentType]              VARCHAR (2)      NOT NULL,
    [UserReference1]            VARCHAR (30)     NULL,
    [UserReference2]            VARCHAR (30)     NULL,
    [RequisitionNumber ]        VARCHAR (9)      NULL,
    [ChequeDepositNumber]       VARCHAR (30)     NULL,
    [BankAccountNumber]         VARCHAR (17)     NOT NULL,
    [UniqueUserCode]            VARCHAR (4)      NULL,
    [BankBranch]                VARCHAR (10)     NULL,
    [SubType]                   VARCHAR (10)     NULL,
    [TransactionDate]           DATETIME         NULL,
    [StatementDate]             DATETIME         NULL,
    [EStatementNumber]          VARCHAR (30)     NULL,
    [StatementNumber]           VARCHAR (30)     NULL,
    [BankName]                  VARCHAR (50)     NULL,
    [RecordID]                  VARCHAR (30)     NULL,
    [HyphenDateProcessed]       DATETIME         NULL,
    [BankAndStatementDate]      DATETIME         NULL,
    [ReReceiveCode]             VARCHAR (30)     NULL,
    [StatementTransactionCount] INT              NULL,
    [NettAmount]                BIGINT           NULL,
    [HyphenDateReceived]        DATETIME         NULL,
    [Status]                    INT              NULL,
    [StatementAndLineNumber]    VARCHAR (30)     NULL,
    [BatchNumber]               VARCHAR (30)     NULL,
    [DebitCredit]               VARCHAR (30)     NULL,
    [StatementLineNumber]       INT              NULL,
    [ErrorCode]                 VARCHAR (30)     NULL,
    [Proccessed]                BIT              CONSTRAINT [DF__BankState__Procc__2804A6E7] DEFAULT ((0)) NOT NULL,
    [User]                      VARCHAR (100)    NULL,
    [Code1]                     VARCHAR (100)    NULL,
    [Code2]                     VARCHAR (100)    NULL,
    [UserReference]             VARCHAR (100)    NULL,
    [ClaimCheckReference]       UNIQUEIDENTIFIER NULL,
    [Premium]                   INT              NULL,
    [Commission]                INT              NULL,
    CONSTRAINT [PK_finance.BankStatementEntries] PRIMARY KEY CLUSTERED ([BankStatementEntryId] ASC),
    CONSTRAINT [FK_BankStatementEntry_BankStatementEntryType] FOREIGN KEY ([BankStatementEntryTypeId]) REFERENCES [common].[BankStatementEntryType] ([Id])
);




GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference1';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UserReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'User';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'User';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'User';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'User';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'User';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'User';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'UniqueUserCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'TransactionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'SubType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'SubType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'SubType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'SubType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'SubType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'SubType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Status';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementTransactionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementTransactionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementTransactionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementTransactionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementTransactionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementTransactionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementAndLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementAndLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementAndLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementAndLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementAndLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'StatementAndLineNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ReReceiveCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ReReceiveCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ReReceiveCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ReReceiveCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ReReceiveCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ReReceiveCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RequisitionNumber ';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RecordID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RecordID';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RecordID';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RecordID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RecordID';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'RecordID';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Proccessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Proccessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Proccessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Proccessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Proccessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Proccessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'NettAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'NettAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'NettAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'NettAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'NettAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'NettAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateReceived';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'HyphenDateProcessed';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'EStatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'EStatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'EStatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'EStatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'EStatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'EStatementNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DocumentType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DebitCredit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DebitCredit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DebitCredit';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DebitCredit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DebitCredit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'DebitCredit';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'Code1';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ClaimCheckReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ClaimCheckReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ClaimCheckReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ClaimCheckReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ClaimCheckReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ClaimCheckReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ChequeDepositNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ChequeDepositNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ChequeDepositNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ChequeDepositNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ChequeDepositNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'ChequeDepositNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BatchNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankStatementEntryId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAndStatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAndStatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAndStatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAndStatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAndStatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAndStatementDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankStatementEntry', @level2type = N'COLUMN', @level2name = N'BankAccountNumber';

