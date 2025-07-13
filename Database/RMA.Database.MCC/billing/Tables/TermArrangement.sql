CREATE TABLE [billing].[TermArrangement] (
    [TermArrangementId]                 INT             IDENTITY (1, 1) NOT NULL,
    [TotalAmount]                       DECIMAL (18, 2) NOT NULL,
    [TermArrangementStatusId]           INT             NOT NULL,
    [PaymentMethodId]                   INT             NOT NULL,
    [StartDate]                         DATE            NOT NULL,
    [EndDate]                           DATE            NOT NULL,
    [IsDeleted]                         BIT             CONSTRAINT [DF_TermArrangement_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                         VARCHAR (50)    NOT NULL,
    [CreatedDate]                       DATETIME        NOT NULL,
    [ModifiedBy]                        VARCHAR (50)    NOT NULL,
    [ModifiedDate]                      DATETIME        NOT NULL,
    [NotificationDate]                  DATETIME        NULL,
    [TermMonths]                        INT             NOT NULL,
    [Balance]                           DECIMAL (18, 2) NOT NULL,
    [ApprovalDate]                      DATE            NULL,
    [RolePlayerId]                      INT             NULL,
    [TermArrangementPaymentFrequencyId] INT             CONSTRAINT [DF_TermArrangement_PaymentFrequencyId] DEFAULT ((2)) NOT NULL,
    [TermApplicationDeclineReasonId]    INT             NULL,
    [IsActive]                          BIT             DEFAULT ((0)) NOT NULL,
    [FinancialYearId]                   INT             NULL,
    [InterestProcessed]                 BIT             CONSTRAINT [DF_TermArrangement_InterestProcessed] DEFAULT ((0)) NULL,
    [ParentTermArrangementId]           INT             NULL,
    [OverlapsBillingCycles]             BIT             NULL,
    [BalanceCarriedToNextCycle]         DECIMAL (18, 2) NULL,
    [BankAccountId]                     INT             NULL,
    CONSTRAINT [PK_TermArrangement] PRIMARY KEY CLUSTERED ([TermArrangementId] ASC),
    CONSTRAINT [FK_TermArrangement_BankAccount] FOREIGN KEY ([BankAccountId]) REFERENCES [common].[BankAccount] ([Id]),
    CONSTRAINT [FK_TermArrangement_IndustryFinancialYear] FOREIGN KEY ([FinancialYearId]) REFERENCES [billing].[IndustryFinancialYear] ([IndustryFinancialYearId]),
    CONSTRAINT [FK_TermArrangement_TermArrangementPaymentFrequency] FOREIGN KEY ([TermArrangementPaymentFrequencyId]) REFERENCES [common].[TermArrangementPaymentFrequency] ([Id])
);














GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TotalAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermMonths';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermMonths';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermMonths';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermMonths';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermMonths';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermMonths';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'NotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'NotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'NotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'NotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'NotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'NotificationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO



GO



GO



GO



GO



GO



GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ApprovalDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangement', @level2type = N'COLUMN', @level2name = N'ApprovalDate';

