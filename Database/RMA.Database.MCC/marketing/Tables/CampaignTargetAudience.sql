CREATE TABLE [marketing].[CampaignTargetAudience] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [CampaignId]         INT           NOT NULL,
    [ChannelId]          INT           NOT NULL,
    [Name]               VARCHAR (250) NOT NULL,
    [SurName]            VARCHAR (100) NOT NULL,
    [Email]              VARCHAR (200) NOT NULL,
    [Phone]              VARCHAR (15)  NOT NULL,
    [IsSent]             INT           NOT NULL,
    [CampaignTempateId]  INT           NOT NULL,
    [IsDelivered]        BIT           NOT NULL,
    [CampaignScheduleId] INT           NOT NULL,
    [IsActive]           BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]          BIT           NOT NULL,
    [CreatedBy]          VARCHAR (100) NOT NULL,
    [CreatedDate]        DATETIME      NOT NULL,
    [ModifiedBy]         VARCHAR (100) NOT NULL,
    [ModifiedDate]       DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignTargetAudience] PRIMARY KEY CLUSTERED ([Id] ASC)
);

