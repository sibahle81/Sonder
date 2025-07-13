CREATE TABLE [legal].[JudgementDecision] (
    [Id]                                 INT            IDENTITY (1, 1) NOT NULL,
    [ObjectionId]                        INT            NOT NULL,
    [LegalCareJudgementDecisionStatusId] INT            NOT NULL,
    [Notes]                              VARCHAR (1000) NOT NULL,
    [IsActive]                           BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]                          BIT            NOT NULL,
    [CreatedBy]                          VARCHAR (100)  NOT NULL,
    [CreatedDate]                        DATETIME       NOT NULL,
    [ModifiedBy]                         VARCHAR (100)  NOT NULL,
    [ModifiedDate]                       DATETIME       NOT NULL,
    CONSTRAINT [PK_JudgementDecision] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].[trg_AfterAdd_JudgementDecision] ON [legal].[JudgementDecision]   
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
[legal].[actionlog].ModuleId ,
[legal].[actionlog].ActionType,
[legal].[actionlog].IsDeleted,
[legal].[actionlog].CreatedBy,
[legal].[actionlog].CreatedDate,
[legal].[actionlog].ModifiedBy,
[legal].[actionlog].ModifiedDate)   
Select ObjectionId,
'Judgement decision' +' - '+ (select common.LegalCareJudgementDecisionStatus.Name  from common.LegalCareJudgementDecisionStatus where common.LegalCareJudgementDecisionStatus.id=LegalCareJudgementDecisionStatusId),
Notes, 
CreatedBy ,
getdate(),
getdate(),
'',
3, 
'Add Judgement Decision',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM Inserted;