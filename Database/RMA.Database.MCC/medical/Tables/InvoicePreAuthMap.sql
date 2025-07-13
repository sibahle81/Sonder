CREATE TABLE [medical].[InvoicePreAuthMap] (
    [InvoicePreAuthMapId] INT          IDENTITY (1, 1) NOT NULL,
    [InvoiceId]           INT          NULL,
    [TebaInvoiceId]       INT          NULL,
    [PreAuthId]           INT          NOT NULL,
    [IsDeleted]           BIT          CONSTRAINT [DF_InvoicePreAuthMap_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]           VARCHAR (50) NOT NULL,
    [CreatedDate]         DATETIME     CONSTRAINT [DF_InvoicePreAuthMap_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]        DATETIME     CONSTRAINT [DF_InvoicePreAuthMap_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_InvoicePreAuthMap] PRIMARY KEY CLUSTERED ([InvoicePreAuthMapId] ASC),
    CONSTRAINT [FK_InvoicePreAuthMap_Invoice] FOREIGN KEY ([InvoiceId]) REFERENCES [medical].[Invoice] ([InvoiceId]),
    CONSTRAINT [FK_InvoicePreAuthMap_TebaInvoice] FOREIGN KEY ([TebaInvoiceId]) REFERENCES [medical].[TebaInvoice] ([TebaInvoiceId]),
    CONSTRAINT [FK_InvoicePreAuthMap_PreAuthorisation] FOREIGN KEY ([PreAuthId]) REFERENCES [medical].[PreAuthorisation] ([PreAuthId])
);

