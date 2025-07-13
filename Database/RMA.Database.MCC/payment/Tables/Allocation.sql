CREATE TABLE [payment].[Allocation] (
    [AllocationId]             INT             IDENTITY (1, 1) NOT NULL,
    [PaymentId]                INT             NULL,
    [PayeeId]                  INT             NOT NULL,
    [AllocationStatusId]       INT             NOT NULL,
    [ClaimInvoiceAllocationId] INT             NULL,
    [MedicalInvoiceId]         INT             NULL,
    [DaysOffInvoiceId]         INT             NULL,
    [MonthlyPensionLedgerId]   INT             NULL,
    [CommutationId]            INT             NULL,
    [OverPaymentId]            INT             NULL,
    [PDAwardId]                INT             NULL,
    [AssessedAmount]           DECIMAL (18, 2) NOT NULL,
    [AssessedVAT]              DECIMAL (18, 2) NOT NULL,
    [AssessedAmountInclusive]  AS              ([AssessedAmount]+[AssessedVAT]),
    [IsActive]                 BIT             CONSTRAINT [DF__Allocatio__IsAct__15879AA7] DEFAULT ((1)) NOT NULL,
    [IsDeleted]                BIT             CONSTRAINT [DF__Allocatio__IsDel__167BBEE0] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                VARCHAR (50)    NOT NULL,
    [CreatedDate]              DATETIME        CONSTRAINT [DF__Allocatio__Creat__176FE319] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]               VARCHAR (50)    NOT NULL,
    [ModifiedDate]             DATETIME        NOT NULL,
    [PaymentTypeId]            INT             NULL,
    CONSTRAINT [PK_Payment_Allocation] PRIMARY KEY CLUSTERED ([AllocationId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Allocation_ClaimInvoice] FOREIGN KEY ([ClaimInvoiceAllocationId]) REFERENCES [claim].[ClaimInvoice] ([ClaimInvoiceId]),
    CONSTRAINT [FK_Allocation_Invoice] FOREIGN KEY ([MedicalInvoiceId]) REFERENCES [medical].[Invoice] ([InvoiceId]),
    CONSTRAINT [FK_Allocation_Payment] FOREIGN KEY ([PaymentId]) REFERENCES [payment].[Payment] ([PaymentId]),
    CONSTRAINT [FK_Allocation_PaymentAllocationStatus] FOREIGN KEY ([AllocationStatusId]) REFERENCES [common].[PaymentAllocationStatus] ([Id]),
    CONSTRAINT [FK_Allocation_PaymentType] FOREIGN KEY ([PaymentTypeId]) REFERENCES [common].[PaymentType] ([Id]),
    CONSTRAINT [FK_Allocation_RolePlayer] FOREIGN KEY ([PayeeId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);












GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PDAwardId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PDAwardId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PDAwardId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PDAwardId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PDAwardId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PDAwardId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'PayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'MedicalInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'MedicalInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'MedicalInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'MedicalInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'MedicalInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'MedicalInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'DaysOffInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'DaysOffInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'DaysOffInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'DaysOffInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'DaysOffInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'DaysOffInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO



GO



GO



GO



GO



GO



GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AllocationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AssessedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AssessedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AssessedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AssessedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AssessedAmountInclusive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'Allocation', @level2type = N'COLUMN', @level2name = N'AssessedAmountInclusive';

