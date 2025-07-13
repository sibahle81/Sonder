CREATE TABLE [Load].[ConsolidatedFuneralError] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [ErrorCategory]  VARCHAR (128)    NOT NULL,
    [ErrorMessage]   VARCHAR (256)    NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] DESC)
);




GO
CREATE NONCLUSTERED INDEX [idx_ConsolidatedFuneralError_FileIdentifier]
    ON [Load].[ConsolidatedFuneralError]([FileIdentifier] ASC);
GO
