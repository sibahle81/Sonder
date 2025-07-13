CREATE TABLE [claim].[FatalLumpSumInvoice] (
    [ClaimInvoiceId] INT           NOT NULL,
    [PayeeId]        INT           NOT NULL,
    [PayeeTypeId]    INT           NOT NULL,
    [Description]    VARCHAR (250) NOT NULL,
    [CreatedBy]      VARCHAR (50)  NOT NULL,
    [CreatedDate]    DATETIME      NOT NULL,
    [ModifiedBy]     VARCHAR (50)  NOT NULL,
    [ModifiedDate]   DATETIME      NOT NULL,
    [ClaimId]        INT           NOT NULL,
    CONSTRAINT [PK_FatalLumpSumInvoice] PRIMARY KEY CLUSTERED ([ClaimInvoiceId] ASC),
    CONSTRAINT [FK_FatalLumpSumInvoice_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_FatalLumpSumInvoice_ClaimInvoice] FOREIGN KEY ([ClaimInvoiceId]) REFERENCES [claim].[ClaimInvoice] ([ClaimInvoiceId])
);

