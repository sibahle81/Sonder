CREATE TABLE [common].[PoolWorkFlow] (
    [PoolWorkFlowId]         INT          IDENTITY (1, 1) NOT NULL,
    [ItemId]                 INT          NOT NULL,
    [WorkPoolId]             INT          NOT NULL,
    [AssignedByUserId]       INT          NOT NULL,
    [AssignedToUserId]       INT          NULL,
    [EffectiveFrom]          DATETIME     NOT NULL,
    [EffectiveTo]            DATETIME     NULL,
    [isDeleted]              BIT          NOT NULL,
    [CreatedBy]              VARCHAR (50) NOT NULL,
    [CreatedDate]            DATETIME     NOT NULL,
    [ModifiedBy]             VARCHAR (50) NOT NULL,
    [ModifiedDate]           DATETIME     NOT NULL,
    [PoolWorkFlowItemTypeId] INT          DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_PoolWorkFlow] PRIMARY KEY CLUSTERED ([PoolWorkFlowId] ASC)
);

