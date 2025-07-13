CREATE TABLE [claim].[FuneralExpenseInvoice] (
    [ClaimInvoiceId]    INT           NOT NULL,
    [Description]       VARCHAR (255) NOT NULL,
    [PayeeTypeId]       INT           NOT NULL,
    [IsDeleted]         BIT           NOT NULL,
    [CreatedBy]         VARCHAR (50)  NOT NULL,
    [CreatedDate]       DATETIME      NOT NULL,
    [ModifiedBy]        VARCHAR (50)  NOT NULL,
    [ModifiedDate]      DATETIME      NOT NULL,
    [ClaimId]           INT           NOT NULL,
    [PayeeRolePlayerId] INT           NULL,
    CONSTRAINT [PK_FuneralExpenseInvoice] PRIMARY KEY CLUSTERED ([ClaimInvoiceId] ASC),
    CONSTRAINT [FK_FuneralExpenseInvoice_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_FuneralExpenseInvoice_ClaimInvoice] FOREIGN KEY ([ClaimInvoiceId]) REFERENCES [claim].[ClaimInvoice] ([ClaimInvoiceId])
);

