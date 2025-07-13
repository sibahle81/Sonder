CREATE TABLE [common].[SmsAuditDetailStatusType] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (60) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    UNIQUE NONCLUSTERED ([Name] ASC)
);

