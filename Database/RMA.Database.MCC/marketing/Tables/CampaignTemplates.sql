CREATE TABLE [marketing].[CampaignTemplates] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [Name]         VARCHAR (250) NOT NULL,
    [ScheduleDay]  INT           NOT NULL,
    [ScheduleTime] VARCHAR (12)  NOT NULL,
    [IsActive]     BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (100) NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (100) NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignTemplates] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE  TRIGGER [marketing].[trg_AfterAdd_CampaignTemplates] ON [marketing].[CampaignTemplates]   
FOR INSERT 
AS  
insert into [marketing].[Actionlog]   
([marketing].[actionlog].ObjectionId,
[legal].[actionlog].Title,
[legal].[actionlog].Comment,
[legal].[actionlog].AddedByUser,
[legal].[actionlog].[Date],
[legal].[actionlog].[Time],
[legal].[actionlog].ActionType,
[legal].[actionlog].IsDeleted,
[legal].[actionlog].CreatedBy,
[legal].[actionlog].CreatedDate,
[legal].[actionlog].ModifiedBy,
[legal].[actionlog].ModifiedDate)   
Select Id,
'Campaign template added'+ ' ' Name,
'', 
CreatedBy ,
getdate(),
getdate(),
'Campaign Template Create',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted
GO
CREATE TRIGGER [marketing].[trg_AfterUpdate_CampaignTemplates] ON [marketing].[CampaignTemplates]   
FOR UPDATE 
AS  
insert into [marketing].[Actionlog]   
([marketing].[actionlog].ObjectionId,
[legal].[actionlog].Title,
[legal].[actionlog].Comment,
[legal].[actionlog].AddedByUser,
[legal].[actionlog].[Date],
[legal].[actionlog].[Time],
[legal].[actionlog].ActionType,
[legal].[actionlog].IsDeleted,
[legal].[actionlog].CreatedBy,
[legal].[actionlog].CreatedDate,
[legal].[actionlog].ModifiedBy,
[legal].[actionlog].ModifiedDate)   
Select Id ,
'Campaign template updated'+ ' '+ Name,
'', 
ModifiedBy ,
getdate(),
getdate(),
'Campaign Template Update',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted