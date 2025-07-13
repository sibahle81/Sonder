CREATE TABLE [pension].[OverPaymentsWriteOff] (
    [Id]            INT          IDENTITY (1, 1) NOT NULL,
    [OverPaymentId] INT          NOT NULL,
    [Amount]        MONEY        NOT NULL,
    [IsActive]      BIT          CONSTRAINT [DF_OverPaymentsWriteOff_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]     BIT          NOT NULL,
    [CreatedBy]     VARCHAR (50) NOT NULL,
    [CreatedDate]   DATETIME     NOT NULL,
    [ModifiedBy]    VARCHAR (50) NOT NULL,
    [ModifiedDate]  DATETIME     NOT NULL,
    CONSTRAINT [PK_OverPaymentsWriteOff] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_OverPaymentsWriteOff_OutstandingOverpayments] FOREIGN KEY ([OverPaymentId]) REFERENCES [pension].[OutstandingOverpayments] ([Id])
);

