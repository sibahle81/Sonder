CREATE TABLE [marketing].[CampaignTemplateChannels] (
    [Id]                            INT           IDENTITY (1, 1) NOT NULL,
    [CampaignTemplateId]            INT           NOT NULL,
    [ChannelId]                     INT           NOT NULL,
    [Message]                       VARCHAR (MAX) NOT NULL,
    [MarketingChannelMessageTypeId] INT           NOT NULL,
    [EmailSubject]                  VARCHAR (500) NULL,
    [WhatsappTemplateId]            INT           NOT NULL,
    [ButtonTypeId]                  INT           NOT NULL,
    [ActionTypeId]                  INT           NOT NULL,
    [CallButtonText]                VARCHAR (100) NOT NULL,
    [CallPhoneNumber]               VARCHAR (15)  NOT NULL,
    [VisitSiteButtonText]           VARCHAR (100) NOT NULL,
    [VisitSiteURLType]              VARCHAR (50)  NOT NULL,
    [VisitSiteWebsiteURL]           VARCHAR (500) NOT NULL,
    [IsActive]                      BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]                     BIT           NOT NULL,
    [CreatedBy]                     VARCHAR (100) NOT NULL,
    [CreatedDate]                   DATETIME      NOT NULL,
    [ModifiedBy]                    VARCHAR (100) NOT NULL,
    [ModifiedDate]                  DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignTemplateChannels] PRIMARY KEY CLUSTERED ([Id] ASC)
);

