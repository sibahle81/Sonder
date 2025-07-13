CREATE TABLE [billing].[BundleRaise] (
    [BundleRaiseId]    INT             IDENTITY (1, 1) NOT NULL,
    [IsDeleted]        BIT             NOT NULL,
    [CreatedBy]        VARCHAR (50)    NOT NULL,
    [CreatedDate]      DATETIME        NOT NULL,
    [ModifiedBy]       VARCHAR (50)    NOT NULL,
    [ModifiedDate]     DATETIME        NOT NULL,
    [Premium]          DECIMAL (18, 4) NOT NULL,
    [PolicyId]         INT             NOT NULL,
    [InitialInvoiceId] INT             NOT NULL,
    [ApprovalDate]     DATETIME        NOT NULL,
    [ApprovedBy]       VARCHAR (50)    NOT NULL,
    CONSTRAINT [PK_billing.BundleRaise] PRIMARY KEY CLUSTERED ([BundleRaiseId] ASC),
    CONSTRAINT [FK_BundleRaise_Invoice] FOREIGN KEY ([InitialInvoiceId]) REFERENCES [billing].[Invoice] ([InvoiceId]),
    CONSTRAINT [FK_BundleRaise_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId])
);

