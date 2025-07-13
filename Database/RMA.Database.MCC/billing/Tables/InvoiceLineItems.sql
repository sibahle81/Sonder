CREATE TABLE [billing].[InvoiceLineItems] (
    [InvoiceLineItemsId]    INT             IDENTITY (1, 1) NOT NULL,
    [InvoiceId]             INT             NOT NULL,
    [Amount]                DECIMAL (18, 2) NULL,
    [PolicyId]              INT             NULL,
    [IsDeleted]             BIT             CONSTRAINT [DF__InvoiceLi__IsDel__391C8655] DEFAULT ((0)) NOT NULL,
    [CreatedBy]             VARCHAR (50)    NOT NULL,
    [CreatedDate]           DATETIME        CONSTRAINT [DF_InvoiceLineItems_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]            VARCHAR (50)    NOT NULL,
    [ModifiedDate]          DATETIME        CONSTRAINT [DF_InvoiceLineItems_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    [PolicyStatusId]        INT             NULL,
    [IsExcludedDueToStatus] BIT             CONSTRAINT [DF_InvoiceLineItems_IsExcludedDueToStatus] DEFAULT ((0)) NULL,
    [InsurableItem]         NVARCHAR (MAX)  NULL,
    [NoOfEmployees]         INT             NULL,
    [Earnings]              DECIMAL (18, 2) NULL,
    [Rate]                  DECIMAL (18, 2) NULL,
    [PremiumPayable]        DECIMAL (18, 2) NULL,
    [Percentage]            DECIMAL (18, 2) NULL,
    [PaymentAmount]         DECIMAL (18, 2) NULL,
    [ActualPremium]         DECIMAL (18, 2) NULL,
    [CoverStartDate]        DATETIME        NULL,
    [CoverEndDate]          DATETIME        NULL,
    CONSTRAINT [PK_InvoiceLineItems] PRIMARY KEY CLUSTERED ([InvoiceLineItemsId] ASC),
    CONSTRAINT [FK_InvoiceLineItems_Invoice] FOREIGN KEY ([InvoiceId]) REFERENCES [billing].[Invoice] ([InvoiceId])
);












GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceLineItemsId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceLineItemsId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceLineItemsId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceLineItemsId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceLineItemsId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceLineItemsId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'InvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'InvoiceLineItems', @level2type = N'COLUMN', @level2name = N'Amount';

