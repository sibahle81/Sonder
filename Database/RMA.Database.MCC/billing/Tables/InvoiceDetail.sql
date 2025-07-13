CREATE TABLE [billing].[InvoiceDetail] (
    [InvoiceDetailId]       INT             IDENTITY (1, 1) NOT NULL,
    [InvoiceId]             INT             NOT NULL,
    [Percentage]            DECIMAL (18, 2) NULL,
    [PremiumPayable]        DECIMAL (18, 2) NULL,
    [PaymentAmount]         DECIMAL (18, 2) NULL,
    [ActualPremium]         DECIMAL (18, 2) NULL,
    [PreviousBillingAmount] DECIMAL (18, 2) NULL,
    [CoverStartDate]        DATETIME        NULL,
    [CoverEndDate]          DATETIME        NULL,
    [PendingThirtyDaysLog]  BIT             NULL,
    [IsDeleted]             BIT             NOT NULL,
    [CreatedBy]             VARCHAR (50)    NOT NULL,
    [CreatedDate]           DATETIME        NOT NULL,
    [ModifiedBy]            VARCHAR (50)    NOT NULL,
    [ModifiedDate]          DATETIME        NOT NULL,
    CONSTRAINT [PK_InvoiceDetail] PRIMARY KEY CLUSTERED ([InvoiceDetailId] ASC),
    CONSTRAINT [FK_InvoiceDetail_Invoice] FOREIGN KEY ([InvoiceId]) REFERENCES [billing].[Invoice] ([InvoiceId])
);

