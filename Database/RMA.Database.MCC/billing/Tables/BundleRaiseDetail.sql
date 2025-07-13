CREATE TABLE [billing].[BundleRaiseDetail] (
    [BundleRaiseDetailId] INT             IDENTITY (1, 1) NOT NULL,
    [IsDeleted]           BIT             NOT NULL,
    [CreatedBy]           VARCHAR (50)    NOT NULL,
    [CreatedDate]         DATETIME        NOT NULL,
    [ModifiedBy]          VARCHAR (50)    NOT NULL,
    [ModifiedDate]        DATETIME        NOT NULL,
    [Premium]             DECIMAL (18, 2) NOT NULL,
    [PolicyId]            INT             NOT NULL,
    [BundleRaiseHeaderId] INT             NOT NULL,
    [InvoiceId]           INT             NULL,
    CONSTRAINT [PK_billing.BundleRaiseDetail] PRIMARY KEY CLUSTERED ([BundleRaiseDetailId] ASC),
    CONSTRAINT [FK_BundleRaiseDetail_BundleRaiseHeader] FOREIGN KEY ([BundleRaiseHeaderId]) REFERENCES [billing].[BundleRaiseHeader] ([BundleRaiseHeaderId]),
    CONSTRAINT [FK_BundleRaiseDetail_Invoice] FOREIGN KEY ([InvoiceId]) REFERENCES [billing].[Invoice] ([InvoiceId]),
    CONSTRAINT [FK_BundleRaiseDetail_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId])
);

