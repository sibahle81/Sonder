CREATE TABLE [legal].[Note] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [LegalReferenceId] INT            NOT NULL,
    [LegalModuleId]    INT            NOT NULL,
    [Notes]            VARCHAR (1000) NOT NULL,
    [DocumentURL]      VARCHAR (500)  NULL,
    [IsActive]         BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]        BIT            NOT NULL,
    [CreatedBy]        VARCHAR (100)  NOT NULL,
    [CreatedDate]      DATETIME       NOT NULL,
    [ModifiedBy]       VARCHAR (100)  NOT NULL,
    [ModifiedDate]     DATETIME       NOT NULL,
    CONSTRAINT [PK_Note] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].[trg_AfterAdd_Note] ON [legal].[Note]   
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
Select LegalReferenceId ,
'Note added',
Notes, 
CreatedBy ,
getdate(),
getdate(),
'',
LegalModuleId , 
'Note Added',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted