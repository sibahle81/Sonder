CREATE TABLE [debt].[ClientCallLog] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [FinPayeeId]   INT            NOT NULL,
    [DateTime]     DATETIME       NOT NULL,
    [AudioFile]    VARCHAR (1000) NOT NULL,
    [ClientNumber] VARCHAR (15)   NOT NULL,
    [Status]       INT            NOT NULL,
    [IsActive]     BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (100)  NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (100)  NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_ClientCallLog] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE  TRIGGER [debt].[trg_AfterAddClientCallLog] ON [debt].[ClientCallLog]   
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
[debt].[ActionLogs].IsActive  ,
[debt].[ActionLogs].IsDeleted ,
[debt].[ActionLogs].CreatedBy ,
[debt].[ActionLogs].CreatedDate,
[debt].[ActionLogs].ModifiedBy,
[debt].[ActionLogs].ModifiedDate)   
Select FinPayeeId,
'Call Log Add', 
ClientNumber , 
'', 
DateTime,
getdate(),
'Call Happened on '+DateTime+ ' to ',
IsActive, 
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM    inserted