CREATE TABLE [billing].[BatchInvoiceDetail] (
    [BatchInvoiceDetailId]  BIGINT          IDENTITY (1, 1) NOT NULL,
    [BatchInvoiceId]        INT             NOT NULL,
    [PolicyId]              INT             NOT NULL,
    [Premium]               DECIMAL (18, 2) NOT NULL,
    [PolicyStatusId]        INT             NOT NULL,
    [IsDeleted]             BIT             CONSTRAINT [DF_BatchInvoiceDetail_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]             VARCHAR (50)    NOT NULL,
    [CreatedDate]           DATETIME        NOT NULL,
    [ModifiedBy]            VARCHAR (50)    NOT NULL,
    [ModifiedDate]          DATETIME        NOT NULL,
    [IsExcludedDueToStatus] BIT             NOT NULL,
    CONSTRAINT [PK_BatchInvoiceDetail] PRIMARY KEY CLUSTERED ([BatchInvoiceDetailId] ASC),
    CONSTRAINT [FK_BatchInvoiceDetail_BatchInvoice] FOREIGN KEY ([BatchInvoiceId]) REFERENCES [billing].[BatchInvoice] ([BatchInvoiceId]),
    CONSTRAINT [FK_BatchInvoiceDetail_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK_BatchInvoiceDetail_PolicyStatus] FOREIGN KEY ([PolicyStatusId]) REFERENCES [common].[PolicyStatus] ([Id])
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'BatchInvoiceDetail';

