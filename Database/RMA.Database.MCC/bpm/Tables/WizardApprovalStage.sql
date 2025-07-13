CREATE TABLE [bpm].[WizardApprovalStage] (
    [WizardApprovalStageId] INT           IDENTITY (1, 1) NOT NULL,
    [WizardId]              INT           NOT NULL,
    [Stage]                 INT           NOT NULL,
    [StatusId]              INT           NOT NULL,
    [RoleId]                INT           NOT NULL,
    [IsActive]              BIT           NOT NULL,
    [Reason]                VARCHAR (500) NULL,
    [ActionedDate]          DATETIME      NULL,
    [ActionedBy]            VARCHAR (100) NULL,
    CONSTRAINT [PK_WizardApprovalStage] PRIMARY KEY CLUSTERED ([WizardApprovalStageId] ASC),
    CONSTRAINT [FK_WizardApprovalStage_Role] FOREIGN KEY ([RoleId]) REFERENCES [security].[Role] ([Id]),
    CONSTRAINT [FK_WizardApprovalStage_Wizard] FOREIGN KEY ([WizardId]) REFERENCES [bpm].[Wizard] ([Id]),
    CONSTRAINT [FK_WizardApprovalStage_WizardApprovalStageStatus] FOREIGN KEY ([StatusId]) REFERENCES [common].[WizardApprovalStageStatus] ([Id])
);

