CREATE TABLE [marketing].[CampaignScheduleGroup] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [CampaignScheduleId] INT           NOT NULL,
    [GroupId]            INT           NOT NULL,
    [IsActive]           BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]          BIT           NOT NULL,
    [CreatedBy]          VARCHAR (100) NOT NULL,
    [CreatedDate]        DATETIME      NOT NULL,
    [ModifiedBy]         VARCHAR (100) NOT NULL,
    [ModifiedDate]       DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignScheduleGroup] PRIMARY KEY CLUSTERED ([Id] ASC)
);

