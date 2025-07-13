CREATE TABLE [common].[SLAStatusChangeAudit] (
    [SLAStatusChangeAuditId] INT           IDENTITY (1, 1) NOT NULL,
    [SLAItemTypeId]          INT           NOT NULL,
    [ItemId]                 INT           NOT NULL,
    [Status]                 VARCHAR (50)  NOT NULL,
    [Reason]                 VARCHAR (250) NULL,
    [EffectiveFrom]          DATETIME      NOT NULL,
    [EffictiveTo]            DATETIME      NULL,
    [isDeleted]              BIT           NOT NULL,
    [CreatedBy]              VARCHAR (50)  NOT NULL,
    [CreatedDate]            DATETIME      NOT NULL,
    [ModifiedBy]             VARCHAR (50)  NOT NULL,
    [ModifiedDate]           DATETIME      NOT NULL,
    CONSTRAINT [PK_SLAStatusChangeAudit] PRIMARY KEY CLUSTERED ([SLAStatusChangeAuditId] ASC)
);

