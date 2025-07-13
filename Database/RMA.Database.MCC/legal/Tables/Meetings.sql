CREATE TABLE [legal].[Meetings] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [ObjectionId]  INT            NOT NULL,
    [Date]         DATETIME       NULL,
    [TimeFrom]     DATETIME       NOT NULL,
    [TimeTo]       DATETIME       NOT NULL,
    [Description]  VARCHAR (1000) NOT NULL,
    [RefDocument]  VARCHAR (1000) NOT NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (100)  NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (100)  NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_Meetings] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].[trg_AfterUpdate_Meetings] ON [legal].[Meetings]   
FOR UPDATE  
AS  
insert into [legal].[Actionlog]   
([legal].[actionlog].ReferralId,
[legal].[actionlog].Title,
[legal].[actionlog].Comment,
[legal].[actionlog].AddedByUser,
[legal].[actionlog].[Date],
[legal].[actionlog].[Time],
[legal].[actionlog].CustomerName,
[legal].[actionlog].ModuleId,
[legal].[actionlog].ActionType,
[legal].[actionlog].IsDeleted,
[legal].[actionlog].CreatedBy,
[legal].[actionlog].CreatedDate,
[legal].[actionlog].ModifiedBy,
[legal].[actionlog].ModifiedDate)   
Select ObjectionId,
'Meeting updated',
Description, 
ModifiedBy ,
getdate(),
getdate(),
'',
3, 
'Update Meeting',
0,
ModifiedBy,
GETDATE(),
ModifiedBy,
getdate() 
FROM Inserted
GO
CREATE TRIGGER [legal].[trg_AfterAdd_Meetings] ON [legal].[Meetings]   
FOR INSERT 
AS  
insert into [legal].[Actionlog]   
([legal].[actionlog].ReferralId,
[legal].[actionlog].Title,
[legal].[actionlog].Comment,
[legal].[actionlog].AddedByUser,
[legal].[actionlog].[Date],
[legal].[actionlog].[Time],
[legal].[actionlog].CustomerName,
[legal].[actionlog].ModuleId,
[legal].[actionlog].ActionType,
[legal].[actionlog].IsDeleted,
[legal].[actionlog].CreatedBy,
[legal].[actionlog].CreatedDate,
[legal].[actionlog].ModifiedBy,
[legal].[actionlog].ModifiedDate)   
Select ObjectionId,
'Meeting scheduled' ,
Description, 
CreatedBy ,
getdate(),
getdate(),
'',
3, 
'Set Meeting',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted