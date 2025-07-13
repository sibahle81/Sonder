CREATE TABLE [legal].[AttorneyInstruction] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [AttorneyId]   INT            NOT NULL,
    [DocPackId]    INT            NOT NULL,
    [Notes]        VARCHAR (1000) NULL,
    [ReferralId]   INT            NOT NULL,
    [CourtOrder]   VARCHAR (50)   NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (100)  NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (100)  NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_AttorneyInstruction] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].[trg_AfterAdd_AttorneyInstruction] ON [legal].[AttorneyInstruction]   
FOR INSERT
AS  
insert into [legal].[Actionlog]   
([legal].[actionlog].ReferralId,
[legal].[actionlog].Title,
[legal].[actionlog].Comment,
[legal].[actionlog].AddedByUser,
[legal].[actionlog].[Date],
[legal].[actionlog].[Time]
,[legal].[actionlog].CustomerName,
[legal].[actionlog].ModuleId,
[legal].[actionlog].ActionType,
[legal].[actionlog].IsDeleted,
[legal].[actionlog].CreatedBy,
[legal].[actionlog].CreatedDate,
[legal].[actionlog].ModifiedBy,
[legal].[actionlog].ModifiedDate)   
Select ReferralId,
'Attorney instruction generated',
Notes,
 CreatedBy ,
 getdate(),
 getdate(),
 '',
 1, 
 'Attorney Instruction',
 
 0,
 CreatedBy ,
 GETDATE(),
 ModifiedBy,
 getdate() 
FROM    inserted