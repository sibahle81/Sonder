CREATE TABLE [billing].[InvoiceReportDetails] (
    [InvoiceReportDetailsId] INT          IDENTITY (1, 1) NOT NULL,
    [InvoiceId]              INT          NULL,
    [ClientCompanyName]      VARCHAR (50) NULL,
    [AddressLine1]           VARCHAR (50) NULL,
    [AddressLine2]           VARCHAR (50) NULL,
    [CountryId]              INT          NOT NULL,
    [Province]               VARCHAR (50) NULL,
    [City]                   VARCHAR (50) NULL,
    [PostalCode]             VARCHAR (50) NULL,
    [IsActive]               BIT          CONSTRAINT [DF__InvoiceRe__IsAct__391C8655] DEFAULT ((0)) NOT NULL,
    [CreatedDate]            DATETIME     NOT NULL,
    [CreatedBy]              VARCHAR (50) NOT NULL,
    [ModifiedBy]             VARCHAR (50) NOT NULL,
    [ModifiedDate]           DATETIME     NOT NULL,
    CONSTRAINT [PK_InvoiceReportDetails] PRIMARY KEY CLUSTERED ([InvoiceReportDetailsId] ASC),
    CONSTRAINT [FK_InvoiceReportDetails_Country] FOREIGN KEY ([CountryId]) REFERENCES [common].[Country] ([Id]),
    CONSTRAINT [FK_InvoiceReportDetails_Invoice] FOREIGN KEY ([InvoiceId]) REFERENCES [billing].[Invoice] ([InvoiceId])
);

