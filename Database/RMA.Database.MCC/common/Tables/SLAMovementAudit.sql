CREATE TABLE [common].[SLAMovementAudit] (
    [SLAMovementAuditId] INT           IDENTITY (1, 1) NOT NULL,
    [SLAItemTypeId]      INT           NOT NULL,
    [ItemId]             INT           NOT NULL,
    [Comment]            VARCHAR (250) NULL,
    [AssignedBy]         VARCHAR (50)  NOT NULL,
    [AssignedTo]         VARCHAR (50)  NOT NULL,
    [EffectiveFrom]      DATETIME      NOT NULL,
    [EffectiveTo]        DATETIME      NULL,
    [isDeleted]          BIT           NOT NULL,
    [CreatedBy]          VARCHAR (50)  NOT NULL,
    [CreatedDate]        DATETIME      NOT NULL,
    [ModifiedBy]         VARCHAR (50)  NOT NULL,
    [ModifiedDate]       DATETIME      NOT NULL,
    CONSTRAINT [PK_SLAMovementAudit] PRIMARY KEY CLUSTERED ([SLAMovementAuditId] ASC)
);

