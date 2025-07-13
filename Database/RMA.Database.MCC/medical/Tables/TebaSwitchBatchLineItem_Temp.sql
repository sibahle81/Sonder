CREATE TABLE [medical].[TebaSwitchBatchLineItem_Temp] (
    [Id]                       INT           IDENTITY (1, 1) NOT NULL,
    [TebaSwitchBatchInvoiceId] INT           NULL,
    [BatchSequenceNumber]      INT           NULL,
    [Quantity]                 VARCHAR (255) NULL,
    [TotalInvoiceLineCostExcl] MONEY         NULL,
    [TotalInvoiceLineVAT]      MONEY         NULL,
    [TotalInvoiceLineCostIncl] MONEY         NULL,
    [ServiceDate]              DATETIME      NULL,
    [CreditAmount]             MONEY         NULL,
    [VATCode]                  VARCHAR (255) NULL,
    [TariffCode]               VARCHAR (255) NULL,
    [Description]              VARCHAR (255) NULL,
    [IsActive]                 BIT           NULL,
    [IsDeleted]                BIT           NOT NULL,
    [CreatedBy]                VARCHAR (50)  NOT NULL,
    [CreatedDate]              DATETIME      NOT NULL,
    [ModifiedBy]               VARCHAR (50)  NOT NULL,
    [ModifiedDate]             DATETIME      NOT NULL,
    CONSTRAINT [PK_TebaSwitchBatchLineItem_Temp] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_TebaSwitchBatchLineItem_Temp_TebaSwitchBatchInvoice_Temp] FOREIGN KEY ([TebaSwitchBatchInvoiceId]) REFERENCES [medical].[TebaSwitchBatchInvoice_Temp] ([TebaSwitchBatchInvoiceId])
);

