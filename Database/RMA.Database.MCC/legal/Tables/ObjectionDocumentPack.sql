CREATE TABLE [legal].[ObjectionDocumentPack] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [PackName]     VARCHAR (100) NOT NULL,
    [ObjectionId]  INT           NOT NULL,
    [AdvisorId]    INT           NOT NULL,
    [IsActive]     BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (100) NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (100) NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK_ObjectionDocumentPack] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].[trg_AfterAdd_ObjectionDocumentPack] ON [legal].[ObjectionDocumentPack]   
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
'Document pack created' ,
'', 
CreatedBy ,
getdate(),
getdate(),
'',
3, 
'Document Pack',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 

FROM inserted
GO
CREATE TRIGGER [legal].[trg_AfterUpdate_ObjectionDocumentPack] ON [legal].[ObjectionDocumentPack]   
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
'Ducument pack updated',
'', 
ModifiedBy ,
getdate(),
getdate(),
'',
3, 
'Update Document Pack',
0,
ModifiedBy,
GETDATE(),
ModifiedBy,
getdate() 
FROM Inserted