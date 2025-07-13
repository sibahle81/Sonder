CREATE TABLE [marketing].[CampaignApprovals] (
    [Id]                        INT            IDENTITY (1, 1) NOT NULL,
    [CampaignId]                INT            NOT NULL,
    [CampaignTypeApproverId]    INT            NULL,
    [ApproverUserId]            INT            NOT NULL,
    [MarketingApprovalStatusId] INT            NOT NULL,
    [RejectionNotes]            VARCHAR (1000) NULL,
    [IsActive]                  BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]                 BIT            NOT NULL,
    [CreatedBy]                 VARCHAR (100)  NOT NULL,
    [CreatedDate]               DATETIME       NOT NULL,
    [ModifiedBy]                VARCHAR (100)  NOT NULL,
    [ModifiedDate]              DATETIME       NOT NULL,
    CONSTRAINT [PK_CampaignApprovals] PRIMARY KEY CLUSTERED ([Id] ASC)
);

