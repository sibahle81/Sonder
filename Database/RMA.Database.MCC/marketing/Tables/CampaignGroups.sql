CREATE TABLE [marketing].[CampaignGroups] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [GroupName]    VARCHAR (250) NOT NULL,
    [IsActive]     BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (100) NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (100) NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignGroups] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE  TRIGGER [marketing].[trg_AfterAdd_CampaignGroups] ON [marketing].[CampaignGroups]   
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
Select Id ,
'Campaign group added',
'', 
CreatedBy ,
getdate(),
getdate(),
'Campaign Group Create',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted
GO
CREATE TRIGGER [marketing].[trg_AfterUpdate_CampaignGroups] ON [marketing].[CampaignGroups]   
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
'Campaign group updated',
'', 
ModifiedBy,
getdate(),
getdate(),
'Campaign Group Update',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted