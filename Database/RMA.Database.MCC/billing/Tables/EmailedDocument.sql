CREATE TABLE [billing].[EmailedDocument] (
    [EmailedDocumentId] INT              IDENTITY (1, 1) NOT NULL,
    [SendGridRequestId] UNIQUEIDENTIFIER NOT NULL,
    [SendGridStatusId]  INT              NULL,
    [DocumentTypeId]    INT              NOT NULL,
    [TransactionId]     INT              NOT NULL,
    [NumberOfRetries]   INT              NULL,
    [IsDeleted]         BIT              NOT NULL,
    [CreatedBy]         VARCHAR (50)     NOT NULL,
    [CreatedDate]       DATETIME         NOT NULL,
    [ModifiedBy]        VARCHAR (50)     NOT NULL,
    [ModifiedDate]      DATETIME         NOT NULL,
    [SendGridMessage]   VARCHAR (MAX)    NULL,
    CONSTRAINT [PK_EmailedDocumentStatus] PRIMARY KEY CLUSTERED ([EmailedDocumentId] ASC),
    CONSTRAINT [FK_EmailedDocumentStatus_EmailDocumentType] FOREIGN KEY ([DocumentTypeId]) REFERENCES [common].[EmailDocumentType] ([Id]),
    CONSTRAINT [FK_EmailedDocumentStatus_SendGridStatus] FOREIGN KEY ([SendGridStatusId]) REFERENCES [common].[SendGridStatus] ([Id]),
    CONSTRAINT [FK_EmailedDocumentStatus_Transactions] FOREIGN KEY ([TransactionId]) REFERENCES [billing].[Transactions] ([TransactionId])
);





