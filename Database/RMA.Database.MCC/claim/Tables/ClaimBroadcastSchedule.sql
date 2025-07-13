CREATE TABLE [claim].[ClaimBroadcastSchedule] (
    [ClaimBroadcastScheduleId] INT           NOT NULL,
    [ParamId]                  INT           NOT NULL,
    [DateChanged]              DATETIME      NOT NULL,
    [UpdatedAbility]           BIT           NOT NULL,
    [MessageType]              INT           NOT NULL,
    [MSMQQueID]                VARCHAR (100) NULL,
    [IsDeleted]                BIT           NOT NULL,
    [CreatedBy]                VARCHAR (50)  NOT NULL,
    [CreatedDate]              DATETIME      NOT NULL,
    [ModifiedBy]               VARCHAR (50)  NOT NULL,
    [ModifiedDate]             DATETIME      NOT NULL,
    CONSTRAINT [PK__ClaimBroadcastSchedule] PRIMARY KEY CLUSTERED ([ClaimBroadcastScheduleId] ASC)
);

