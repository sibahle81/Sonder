CREATE TABLE [debt].[CollectionStatus] (
    [Id]                   INT           IDENTITY (1, 1) NOT NULL,
    [FinPayeeId]           INT           NOT NULL,
    [CollectionStatusId]   INT           NOT NULL,
    [CollectionStatusName] VARCHAR (100) NOT NULL,
    [PTPCount]             INT           NOT NULL,
    [NextActionDate]       DATETIME      NOT NULL,
    [Notes]                VARCHAR (MAX) NOT NULL,
    [DepartmentId]         INT           NOT NULL,
    [DepartmentUserId]     INT           NOT NULL,
    [IsActive]             BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]            BIT           NOT NULL,
    [CreatedBy]            VARCHAR (100) NOT NULL,
    [CreatedDate]          DATETIME      NOT NULL,
    [ModifiedBy]           VARCHAR (100) NOT NULL,
    [ModifiedDate]         DATETIME      NOT NULL,
    CONSTRAINT [PK_CollectionStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE  TRIGGER [debt].[trg_AfterAddCollectionStatus] ON [debt].[CollectionStatus]   
FOR INSERT
AS  
insert into [debt].[ActionLogs]
 ([debt].[ActionLogs].FinPayeeId ,
[debt].[ActionLogs].LogTitle,
[debt].[ActionLogs].Description ,
[debt].[ActionLogs].AgentId ,
[debt].[ActionLogs].AssignDate ,
[debt].[ActionLogs].AssignTime ,
[debt].[ActionLogs].ActionType ,
[debt].[ActionLogs].IsActive ,
[debt].[ActionLogs].IsDeleted ,
[debt].[ActionLogs].CreatedBy ,
[debt].[ActionLogs].CreatedDate,
[debt].[ActionLogs].ModifiedBy,
[debt].[ActionLogs].ModifiedDate)   
Select 
FinPayeeId, 
--(select [debt].CollectionStatusMaster.StatusCategoryName from [debt].CollectionStatusMaster where [debt].CollectionStatusMaster.Id = CollectionStatusId) StatusText ,
(select common.CollectionStatus.Name  from common.CollectionStatus where common.CollectionStatus.Id = CollectionStatusId) StatusText ,
Notes, 
'',
getdate(),
getdate(),
'',
IsActive,
0,
CreatedBy,
GETDATE(),
ModifiedBy,
getdate() 
FROM    inserted