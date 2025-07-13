CREATE TABLE [Load].[RatesUploadErrorAudit] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] VARCHAR (50)  NOT NULL,
    [FileName]       VARCHAR (50)  NOT NULL,
    [ErrorCategory]  VARCHAR (50)  NOT NULL,
    [ErrorMessage]   VARCHAR (256) NOT NULL,
    [ExcelRowNumber] VARCHAR (50)  NOT NULL,
    [UploadDate]     DATETIME      NOT NULL,
    CONSTRAINT [PK_RatesUploadErrorAudit] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'RatesUploadErrorAudit';

