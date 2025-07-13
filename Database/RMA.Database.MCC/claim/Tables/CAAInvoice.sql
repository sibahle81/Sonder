CREATE TABLE [claim].[CAAInvoice] (
    [ClaimInvoiceId]      INT           NOT NULL,
    [PayeeId]             INT           NOT NULL,
    [PayeeTypeId]         INT           NOT NULL,
    [Description]         VARCHAR (100) NOT NULL,
    [UnderAssessedReason] VARCHAR (100) NULL,
    [CalcOperands]        VARCHAR (250) NULL,
    [EarningsId]          INT           NOT NULL,
    [CreatedBy]           VARCHAR (50)  NOT NULL,
    [CreatedDate]         DATETIME      NOT NULL,
    [ModifiedBy]          VARCHAR (50)  NOT NULL,
    [ModifiedDate]        DATETIME      NOT NULL,
    [ClaimId]             INT           NOT NULL,
    CONSTRAINT [PK_CAAInvoice] PRIMARY KEY CLUSTERED ([ClaimInvoiceId] ASC),
    CONSTRAINT [FK_CAAInvoice_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_CAAInvoice_ClaimInvoice] FOREIGN KEY ([ClaimInvoiceId]) REFERENCES [claim].[ClaimInvoice] ([ClaimInvoiceId]),
    CONSTRAINT [FK_CAAInvoice_Earnings] FOREIGN KEY ([EarningsId]) REFERENCES [claim].[Earnings] ([EarningId])
);

