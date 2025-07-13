CREATE TABLE [marketing].[CampaignTemplateChannelsAttachment] (
    [Id]                         INT           IDENTITY (1, 1) NOT NULL,
    [CampaignTemplateChannelsId] INT           NOT NULL,
    [ChannelId]                  INT           NOT NULL,
    [DocumentURL]                VARCHAR (500) NOT NULL,
    [IsActive]                   BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]                  BIT           NOT NULL,
    [CreatedBy]                  VARCHAR (100) NOT NULL,
    [CreatedDate]                DATETIME      NOT NULL,
    [ModifiedBy]                 VARCHAR (100) NOT NULL,
    [ModifiedDate]               DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignTemplateChannelsAttachment] PRIMARY KEY CLUSTERED ([Id] ASC)
);

