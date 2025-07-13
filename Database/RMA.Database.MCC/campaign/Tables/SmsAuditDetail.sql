CREATE TABLE [campaign].[SmsAuditDetail] (
    [SmsAuditDetailId]           INT           IDENTITY (1, 1) NOT NULL,
    [RegistrationDate]           DATETIME      NOT NULL,
    [StatusReportDate]           DATETIME      NOT NULL,
    [SmsNumber]                  VARCHAR (25)  NULL,
    [SmsReference]               VARCHAR (50)  NOT NULL,
    [ErrorDescription]           VARCHAR (250) NULL,
    [SmsAuditDetailStatusTypeId] INT           NULL,
    [StatusDescription]          VARCHAR (250) NULL,
    [Operator]                   VARCHAR (20)  NOT NULL,
    [Campaign]                   VARCHAR (50)  NOT NULL,
    [Department]                 VARCHAR (50)  NOT NULL,
    [UserName]                   VARCHAR (50)  NOT NULL,
    [IsDeleted]                  BIT           DEFAULT ((0)) NOT NULL,
    [CreatedDate]                DATETIME      DEFAULT (getdate()) NOT NULL,
    [CreatedBy]                  VARCHAR (50)  NOT NULL,
    [ModifiedDate]               DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                 VARCHAR (50)  NOT NULL,
    [SmsAuditId]                 INT           NULL,
    PRIMARY KEY CLUSTERED ([SmsAuditDetailId] ASC),
    FOREIGN KEY ([SmsAuditId]) REFERENCES [campaign].[SmsAudit] ([Id]),
    CONSTRAINT [FK_Campaign_SmsAuditDetailStatusType] FOREIGN KEY ([SmsAuditDetailStatusTypeId]) REFERENCES [common].[SmsAuditDetailStatusType] ([Id])
);

