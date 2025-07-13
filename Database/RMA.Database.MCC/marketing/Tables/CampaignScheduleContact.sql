CREATE TABLE [marketing].[CampaignScheduleContact] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [CampaignScheduleId] INT           NOT NULL,
    [MemberNumber]       VARCHAR (20)  NOT NULL,
    [ContactName]        VARCHAR (200) NOT NULL,
    [ContactNumber]      VARCHAR (15)  NOT NULL,
    [Designation]        VARCHAR (100) NOT NULL,
    [CompanyName]        VARCHAR (200) NOT NULL,
    [CompanyNo]          VARCHAR (150) NOT NULL,
    [Category]           VARCHAR (50)  NOT NULL,
    [Type]               VARCHAR (15)  NOT NULL,
    [IsActive]           BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]          BIT           NOT NULL,
    [CreatedBy]          VARCHAR (100) NOT NULL,
    [CreatedDate]        DATETIME      NOT NULL,
    [ModifiedBy]         VARCHAR (100) NOT NULL,
    [ModifiedDate]       DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignScheduleContact] PRIMARY KEY CLUSTERED ([Id] ASC)
);

