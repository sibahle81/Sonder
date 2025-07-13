CREATE TABLE [policy].[PolicyStatusChangeAudit] (
    [PolicyStatusChangeAuditId] INT           IDENTITY (1, 1) NOT NULL,
    [PolicyId]                  INT           NOT NULL,
    [PolicyStatusId]            INT           NOT NULL,
    [Reason]                    VARCHAR (250) NULL,
    [EffectiveFrom]             DATE          NOT NULL,
    [EffectiveTo]               DATE          NULL,
    [RequestedBy]               VARCHAR (50)  NOT NULL,
    [RequestedDate]             DATE          NOT NULL,
    CONSTRAINT [PK_PolicyStatusChangeAudit] PRIMARY KEY CLUSTERED ([PolicyStatusChangeAuditId] ASC),
    CONSTRAINT [FK_PolicyStatusChangeAudit_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId])
);

