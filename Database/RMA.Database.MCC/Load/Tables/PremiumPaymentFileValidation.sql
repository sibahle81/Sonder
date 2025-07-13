CREATE TABLE [Load].[PremiumPaymentFileValidation] (
    [FileId]          INT              IDENTITY (1, 1) NOT NULL,
    [FileName]        VARCHAR (500)    NULL,
    [ProcessStatusId] INT              NULL,
    [CreatedDate]     DATETIME         NOT NULL,
    [CreatedBy]       VARCHAR (50)     NOT NULL,
    [ModifiedBy]      VARCHAR (50)     NOT NULL,
    [IsDeleted]       BIT              NOT NULL,
    [ModifiedDate]    DATETIME         NOT NULL,
    [FileIdentifier]  UNIQUEIDENTIFIER NULL,
    CONSTRAINT [PK_PremiumPaymentFileValidation] PRIMARY KEY CLUSTERED ([FileId] ASC)
);

