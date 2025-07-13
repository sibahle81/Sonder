CREATE TABLE [marketing].[Campaign] (
    [Id]                      INT           IDENTITY (1, 1) NOT NULL,
    [CampaignMarketingTypeId] INT           NOT NULL,
    [Name]                    VARCHAR (250) NOT NULL,
    [IsActive]                BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]               BIT           NOT NULL,
    [CreatedBy]               VARCHAR (100) NOT NULL,
    [CreatedDate]             DATETIME      NOT NULL,
    [ModifiedBy]              VARCHAR (100) NOT NULL,
    [ModifiedDate]            DATETIME      NOT NULL,
    CONSTRAINT [PK_Campaign] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [marketing].[trg_AfterUpdate_Campaign] ON [marketing].[Campaign]   
FOR UPDATE  
AS  
insert into [marketing].[Actionlog]   
([marketing].[actionlog].ObjectionId,
[marketing].[actionlog].Title,
[marketing].[actionlog].Comment,
[marketing].[actionlog].AddedByUser,
[marketing].[actionlog].[Date],
[marketing].[actionlog].[Time],
[marketing].[actionlog].ActionType,
[marketing].[actionlog].IsDeleted,
[marketing].[actionlog].CreatedBy,
[marketing].[actionlog].CreatedDate,
[marketing].[actionlog].ModifiedBy,
[marketing].[actionlog].ModifiedDate)   
Select Id ,
'Campaign updated',
'', 
ModifiedBy ,
getdate(),
getdate(),
'Campaign Update',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted
GO
CREATE  TRIGGER [marketing].[trg_AfterAdd_Campaign] ON [marketing].[Campaign]   
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
'Campaign created',
'', 
CreatedBy ,
getdate(),
getdate(),
'Campaign Create',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted