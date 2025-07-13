CREATE TABLE [marketing].[CampaignType] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [Name]         VARCHAR (250) NOT NULL,
    [IsActive]     BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (100) NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (100) NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK_CampaignType] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE  TRIGGER [marketing].[trg_AfterAdd_CampaignType] ON [marketing].[CampaignType]   
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
'Add campaign type with ' + ' - '+ Name,
'', 
CreatedBy ,
getdate(),
getdate(),
'Campaign Type',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted
GO
CREATE  TRIGGER [marketing].[trg_AfterUpdate_CampaignType] ON [marketing].[CampaignType]   
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
'Campaign type updated'+ ' '+ Name,
'', 
ModifiedBy ,
getdate(),
getdate(),
'Campaign Type Update',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted