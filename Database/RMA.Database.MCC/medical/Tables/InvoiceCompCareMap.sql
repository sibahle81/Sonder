CREATE TABLE [medical].[InvoiceCompCareMap] (
    [InvoiceCompCareMapId]         INT           IDENTITY (1, 1) NOT NULL,
    [InvoiceId]                    INT           NOT NULL,
    [CompCareInvoiceId]            INT           NOT NULL,
    [CompCareClaimId]              INT           NOT NULL,
    [ClaimReferenceNumber]         VARCHAR (50)  NOT NULL,
    [CompCareHealthCareProviderId] INT           NOT NULL,
    [HealthCareProviderName]       VARCHAR (50)  NOT NULL,
    [PracticeNumber]               VARCHAR (50)  NOT NULL,
    [CompCareMessageId]            VARCHAR (100) NOT NULL,
    [IsDeleted]                    BIT           NOT NULL,
    [CreatedBy]                    VARCHAR (50)  NOT NULL,
    [CreatedDate]                  DATETIME      NOT NULL,
    [ModifiedBy]                   VARCHAR (50)  NOT NULL,
    [ModifiedDate]                 DATETIME      NOT NULL,
    CONSTRAINT [PK_InvoiceCompCareMap] PRIMARY KEY CLUSTERED ([InvoiceCompCareMapId] ASC),
    CONSTRAINT [FK_InvoiceCompCareMap_Invoice] FOREIGN KEY ([InvoiceId]) REFERENCES [medical].[Invoice] ([InvoiceId])
);

