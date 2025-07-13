CREATE TABLE [common].[ReportViewedAudit] (
    [ReportViewedAuditId] INT           IDENTITY (1, 1) NOT NULL,
    [UserId]              INT           NOT NULL,
    [ItemType]            VARCHAR (255) NOT NULL,
    [ItemId]              INT           NOT NULL,
    [ReportUrl]           VARCHAR (255) NOT NULL,
    [Action]              VARCHAR (50)  NOT NULL,
    [ActionDate]          DATETIME      NOT NULL,
    CONSTRAINT [PK_ReportViewedAuditId] PRIMARY KEY CLUSTERED ([ReportViewedAuditId] ASC)
);

