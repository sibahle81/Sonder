CREATE TABLE [Load].[BenefitsUploadErrorAudit] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] VARCHAR (128)  NOT NULL,
    [FileName]       NVARCHAR (100) NULL,
    [BenefitName]    VARCHAR (128)  NULL,
    [ErrorCategory]  VARCHAR (128)  NULL,
    [ErrorMessage]   VARCHAR (256)  NULL,
    [ExcelRowNumber] VARCHAR (50)   NULL,
    [CreatedDate]    DATETIME       NULL,
    CONSTRAINT [PK__BenefitsUpl__CDEB13F8A0B7E42D] PRIMARY KEY CLUSTERED ([Id] DESC)
);

