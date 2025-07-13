CREATE TABLE [marketing].[TemplatesInformation] (
    [Id]                  INT           IDENTITY (1, 1) NOT NULL,
    [CampaignTemplatesId] INT           NOT NULL,
    [CampaignId]          INT           NOT NULL,
    [IsActive]            BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]           BIT           NOT NULL,
    [CreatedBy]           VARCHAR (100) NOT NULL,
    [CreatedDate]         DATETIME      NOT NULL,
    [ModifiedBy]          VARCHAR (100) NOT NULL,
    [ModifiedDate]        DATETIME      NOT NULL,
    CONSTRAINT [PK_TemplatesInformation] PRIMARY KEY CLUSTERED ([Id] ASC)
);

