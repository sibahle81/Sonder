CREATE TABLE [marketing].[CampaignTypeApprover] (
    [Id]                      INT           IDENTITY (1, 1) NOT NULL,
    [CampaignMarketingTypeId] INT           NOT NULL,
    [ApproverType]            VARCHAR (12)  NOT NULL,
    [RoleId]                  INT           NOT NULL,
    [IsActive]                BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]               BIT           NOT NULL,
    [CreatedBy]               VARCHAR (100) NOT NULL,
    [CreatedDate]             DATETIME      NOT NULL,
    [ModifiedBy]              VARCHAR (100) NOT NULL,
    [ModifiedDate]            DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignTypeApprover] PRIMARY KEY CLUSTERED ([Id] ASC)
);

