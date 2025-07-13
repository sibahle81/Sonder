CREATE TABLE [payment].[Payment] (
    [PaymentId]               INT           IDENTITY (1, 1) NOT NULL,
    [ClaimId]                 INT           NULL,
    [PolicyId]                INT           NULL,
    [PaymentInstructionId]    INT           NULL,
    [RefundHeaderId]          INT           NULL,
    [CanEdit]                 BIT           NOT NULL,
    [PaymentStatusId]         INT           NULL,
    [PaymentTypeId]           INT           NULL,
    [Payee]                   VARCHAR (80)  NOT NULL,
    [Bank]                    VARCHAR (50)  NOT NULL,
    [BankBranch]              VARCHAR (10)  NOT NULL,
    [AccountNo]               VARCHAR (17)  NOT NULL,
    [Amount]                  MONEY         NOT NULL,
    [RetainedCommission]      MONEY         NULL,
    [Product]                 VARCHAR (100) NULL,
    [Company]                 VARCHAR (10)  NULL,
    [Branch]                  VARCHAR (10)  NULL,
    [SenderAccountNo]         VARCHAR (17)  NULL,
    [BrokerCode]              INT           NULL,
    [BrokerName]              VARCHAR (80)  NULL,
    [FSBAccredited]           BIT           NULL,
    [ErrorCode]               VARCHAR (50)  NULL,
    [MaxSubmissionCount]      INT           NULL,
    [SubmissionCount]         INT           NULL,
    [BankAccountTypeId]       INT           NULL,
    [IdNumber]                VARCHAR (13)  NULL,
    [EmailAddress]            VARCHAR (100) NULL,
    [ClaimTypeId]             INT           NULL,
    [ErrorDescription]        VARCHAR (MAX) NULL,
    [SubmissionDate]          DATETIME      NULL,
    [PaymentConfirmationDate] DATETIME      NULL,
    [ClientNotificationDate]  DATETIME      NULL,
    [CanResubmit]             BIT           NULL,
    [PaymentRejectionTypeId]  INT           NULL,
    [ClientTypeId]            INT           NULL,
    [ClaimReference]          VARCHAR (250) NULL,
    [PolicyReference]         VARCHAR (250) NULL,
    [Reference]               VARCHAR (250) NULL,
    [BatchReference]          VARCHAR (250) NULL,
    [PaymentSubmissonBatchid] INT           NULL,
    [ReconciliationDate]      DATETIME      NULL,
    [RejectionDate]           DATETIME      NULL,
    [TransactionType]         VARCHAR (20)  NULL,
    [IsActive]                BIT           NOT NULL,
    [IsDeleted]               BIT           NOT NULL,
    [CreatedBy]               VARCHAR (50)  NOT NULL,
    [CreatedDate]             DATETIME      NOT NULL,
    [ModifiedBy]              VARCHAR (50)  NOT NULL,
    [ModifiedDate]            DATETIME      NOT NULL,
    [IsImmediatePayment]      BIT           NULL,
    [RecalledDate]            DATETIME      NULL,
    [StrikeDate]              DATETIME      NULL,
    [IsForex]                 BIT           NULL,
    [DestinationCountryId]    INT           NULL,
    [Currency]                NVARCHAR (50) NULL,
    CONSTRAINT [PK_payment.Payment] PRIMARY KEY CLUSTERED ([PaymentId] ASC),
    CONSTRAINT [FK_Payment_AccountType] FOREIGN KEY ([BankAccountTypeId]) REFERENCES [common].[BankAccountType] ([Id]),
    CONSTRAINT [FK_Payment_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_Payment_PaymentInstruction] FOREIGN KEY ([PaymentInstructionId]) REFERENCES [commission].[PaymentInstruction] ([PaymentInstructionId]),
    CONSTRAINT [FK_Payment_PaymentStatus] FOREIGN KEY ([PaymentStatusId]) REFERENCES [common].[PaymentStatus] ([Id]),
    CONSTRAINT [FK_Payment_PaymentSubmissionBatch] FOREIGN KEY ([PaymentSubmissonBatchid]) REFERENCES [payment].[PaymentSubmissionBatch] ([Id]),
    CONSTRAINT [FK_Payment_PaymentType] FOREIGN KEY ([PaymentTypeId]) REFERENCES [common].[PaymentType] ([Id]),
    CONSTRAINT [FK_Payment_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK_Payment_ProductType] FOREIGN KEY ([ClientTypeId]) REFERENCES [common].[ClientType] ([Id]),
    CONSTRAINT [FK_Payment_RefundHeader] FOREIGN KEY ([RefundHeaderId]) REFERENCES [billing].[RefundHeader] ([RefundHeaderId])
);










GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'TransactionType';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SenderAccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SenderAccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SenderAccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SenderAccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SenderAccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'SenderAccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RetainedCommission';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RetainedCommission';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RetainedCommission';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RetainedCommission';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RetainedCommission';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RetainedCommission';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RejectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RejectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RejectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RejectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RejectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RejectionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RefundHeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RefundHeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RefundHeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RefundHeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RefundHeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'RefundHeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ReconciliationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ReconciliationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ReconciliationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ReconciliationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ReconciliationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ReconciliationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Product';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Product';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Product';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Product';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Product';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Product';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentSubmissonBatchid';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentSubmissonBatchid';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentSubmissonBatchid';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentSubmissonBatchid';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentSubmissonBatchid';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentSubmissonBatchid';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentRejectionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentRejectionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentRejectionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentRejectionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentRejectionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentRejectionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentConfirmationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentConfirmationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentConfirmationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentConfirmationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentConfirmationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentConfirmationDate';


GO



GO



GO



GO



GO



GO



GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Payee';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Payee';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Payee';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Payee';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Payee';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Payee';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'MaxSubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'MaxSubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'MaxSubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'MaxSubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'MaxSubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'MaxSubmissionCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO



GO



GO



GO



GO



GO



GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'FSBAccredited';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'FSBAccredited';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'FSBAccredited';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'FSBAccredited';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'FSBAccredited';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'FSBAccredited';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorDescription';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorDescription';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ErrorCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'EmailAddress';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'EmailAddress';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'EmailAddress';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'EmailAddress';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'EmailAddress';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'EmailAddress';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Company';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientNotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientNotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientNotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientNotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientNotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClientNotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanResubmit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanResubmit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanResubmit';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanResubmit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanResubmit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanResubmit';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'CanEdit';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BrokerCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Branch';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Branch';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Branch';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Branch';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Branch';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Branch';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BatchReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankBranch';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankAccountTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankAccountTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankAccountTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankAccountTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankAccountTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'BankAccountTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Bank';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'AccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'AccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'AccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'AccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'AccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'AccountNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Payment', @level2type = N'COLUMN', @level2name = N'PaymentId';

