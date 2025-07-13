CREATE TABLE [billing].[BatchInvoice] (
    [BatchInvoiceId]     INT          IDENTITY (1, 1) NOT NULL,
    [Month]              INT          NOT NULL,
    [Year]               INT          NOT NULL,
    [BatchStatusId]      INT          NOT NULL,
    [IsDeleted]          BIT          CONSTRAINT [DF_BatchInvoice_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]          VARCHAR (50) NOT NULL,
    [CreatedDate]        DATETIME     NOT NULL,
    [ModifiedBy]         VARCHAR (50) NOT NULL,
    [ModifiedDate]       DATETIME     NOT NULL,
    [InvoicedItemTypeId] INT          NOT NULL,
    CONSTRAINT [PK_BatchInvoice] PRIMARY KEY CLUSTERED ([BatchInvoiceId] ASC),
    CONSTRAINT [FK_BatchInvoice_BatchStatus] FOREIGN KEY ([BatchStatusId]) REFERENCES [common].[BatchStatus] ([Id]),
    CONSTRAINT [FK_BatchInvoice_InvoicedItemType] FOREIGN KEY ([InvoicedItemTypeId]) REFERENCES [billing].[InvoicedItemType] ([InvoicedItemTypeId])
);





