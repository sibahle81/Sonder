CREATE TABLE [medical].[UnderAssessReasonWfNotifications_Temp] (
    [ReasonWfNotificationId] INT          IDENTITY (1, 1) NOT NULL,
    [UnderAssessReasonId]    INT          NOT NULL,
    [WorkflowRoutingId]      INT          NOT NULL,
    [NotificationKey]        VARCHAR (10) NOT NULL,
    [IsActive]               BIT          NOT NULL,
    [IsDeleted]              BIT          NOT NULL,
    [CreatedBy]              VARCHAR (50) NOT NULL,
    [CreatedDate]            DATETIME     NOT NULL,
    [ModifiedBy]             VARCHAR (50) NOT NULL,
    [ModifiedDate]           DATETIME     NOT NULL,
    CONSTRAINT [PK_medical_UnderAssessReasonWfNotifications_Temp_ReasonWfNotificationId] PRIMARY KEY CLUSTERED ([ReasonWfNotificationId] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_UnderAssessReasonWfNotifications_Temp_UnderAssessReasonId] FOREIGN KEY ([UnderAssessReasonId]) REFERENCES [common].[UnderAssessReason] ([UnderAssessReasonId]),
    CONSTRAINT [FK_UnderAssessReasonWfNotifications_Temp_WorkflowRoutingId] FOREIGN KEY ([WorkflowRoutingId]) REFERENCES [common].[WorkflowRouting_Temp] ([WorkflowRoutingId])
);

