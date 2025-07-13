CREATE TABLE [claim].[TTDInvoice] (
    [ClaimInvoiceId] INT           IDENTITY (1, 1) NOT NULL,
    [DateReceived]   DATETIME      NOT NULL,
    [PayeeTypeId]    INT           NOT NULL,
    [Payee]          VARCHAR (50)  NOT NULL,
    [Description]    VARCHAR (MAX) NOT NULL,
    [MemberName]     VARCHAR (50)  NOT NULL,
    [OtherEmployer]  VARCHAR (50)  NOT NULL,
    [DateOffFrom]    DATETIME      NOT NULL,
    [DateOffTo]      DATETIME      NOT NULL,
    [InvoiceTypeId]  INT           NOT NULL,
    [FinalInvoice]   VARCHAR (50)  NOT NULL,
    [IsDeleted]      BIT           NOT NULL,
    [CreatedBy]      VARCHAR (50)  NOT NULL,
    [CreatedDate]    DATETIME      NOT NULL,
    [ModifiedBy]     VARCHAR (50)  NOT NULL,
    [ModifiedDate]   DATETIME      NOT NULL,
    PRIMARY KEY CLUSTERED ([ClaimInvoiceId] ASC),
    CONSTRAINT [FK_TTDInvoice_ClaimInvoice] FOREIGN KEY ([ClaimInvoiceId]) REFERENCES [claim].[ClaimInvoice] ([ClaimInvoiceId])
);

