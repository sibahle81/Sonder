CREATE TABLE [legal].[RecoveryDocumentPack] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [AttorneyId]   INT            NOT NULL,
    [PackName]     VARCHAR (500)  NOT NULL,
    [ReferralId]   INT            NOT NULL,
    [Note]         VARCHAR (1000) NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (100)  NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (100)  NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_DocumentPack] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].[trg_AfterAdd_RecoveryDocumentPack] ON [legal].[RecoveryDocumentPack]   
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
Select ReferralId,
'Document pack created' ,
PackName, 
CreatedBy ,
getdate(),
getdate(),
'',
1, 
'Document Pack',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted
GO
CREATE TRIGGER [legal].[trg_AfterUpdate_RecoveryDocumentPack] ON [legal].[RecoveryDocumentPack]   
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
Select ReferralId,
'Ducument pack updated',
'', 
ModifiedBy ,
getdate(),
getdate(),
'',
1, 
'Update Document Pack',
0,
ModifiedBy,
GETDATE(),
ModifiedBy,
getdate() 
FROM Inserted