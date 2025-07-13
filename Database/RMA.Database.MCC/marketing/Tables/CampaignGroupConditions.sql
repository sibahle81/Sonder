CREATE TABLE [marketing].[CampaignGroupConditions] (
    [Id]                INT           IDENTITY (1, 1) NOT NULL,
    [CampaignGroupId]   INT           NOT NULL,
    [Entity]            VARCHAR (150) NOT NULL,
    [ConditionOperator] VARCHAR (150) NOT NULL,
    [Value]             VARCHAR (150) NOT NULL,
    [Operator]          VARCHAR (200) NOT NULL,
    [IsActive]          BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]         BIT           NOT NULL,
    [CreatedBy]         VARCHAR (100) NOT NULL,
    [CreatedDate]       DATETIME      NOT NULL,
    [ModifiedBy]        VARCHAR (100) NOT NULL,
    [ModifiedDate]      DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignGroupConditions] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE  TRIGGER [marketing].[trg_AfterUpdate_CampaignGroupConditions] ON [marketing].[CampaignGroupConditions]   
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
'Group condition(s) updated',
'', 
ModifiedBy ,
getdate(),
getdate(),
'Group Condition(s) Update',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted
GO
CREATE  TRIGGER [marketing].[trg_AfterAdd_CampaignGroupConditions] ON [marketing].[CampaignGroupConditions]   
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
'Group condition(s) added',
'', 
CreatedBy ,
getdate(),
getdate(),
'Group Condition(s) Create',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted