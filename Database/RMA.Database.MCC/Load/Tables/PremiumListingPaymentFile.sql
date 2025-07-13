CREATE TABLE [Load].[PremiumListingPaymentFile] (
    [Id]                     INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]         UNIQUEIDENTIFIER NOT NULL,
    [FileName]               VARCHAR (100)    NOT NULL,
    [IsDeleted]              BIT              NOT NULL,
    [CreatedBy]              VARCHAR (50)     NOT NULL,
    [CreatedDate]            DATETIME         NOT NULL,
    [ModifiedBy]             VARCHAR (50)     NOT NULL,
    [ModifiedDate]           DATETIME         NOT NULL,
    [FileProcessingStatusId] INT              NULL,
    [LinkedTransactionId]    INT              NULL,
    CONSTRAINT [PK_PremiumListingPaymentFile] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PremiumListingPaymentFile_UploadedFileProcessingStatus] FOREIGN KEY ([FileProcessingStatusId]) REFERENCES [common].[UploadedFileProcessingStatus] ([Id])
);



