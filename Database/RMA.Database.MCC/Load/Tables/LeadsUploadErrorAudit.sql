CREATE TABLE [Load].[LeadsUploadErrorAudit] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] VARCHAR (128)  NOT NULL,
    [FileName]       NVARCHAR (100) NULL,
    [MemberName]     VARCHAR (128)  NULL,
    [ErrorCategory]  VARCHAR (128)  NULL,
    [ErrorMessage]   VARCHAR (256)  NULL,
    [ExcelRowNumber] VARCHAR (50)   NULL,
    [CreatedDate]    DATETIME       NULL,
    CONSTRAINT [PK__LeadsUpl__CDEB13F8A0B7E42D] PRIMARY KEY CLUSTERED ([Id] DESC)
);

