CREATE TABLE [debt].[SMS] (
    [Id]              INT           IDENTITY (1, 1) NOT NULL,
    [FinPayeeId]      INT           NOT NULL,
    [ClientNumber]    VARCHAR (15)  NOT NULL,
    [SMSText]         VARCHAR (MAX) NOT NULL,
    [Department]      VARCHAR (200) NOT NULL,
    [UserName]        VARCHAR (100) NOT NULL,
    [Campaign]        VARCHAR (100) NOT NULL,
    [SMSResponse]     VARCHAR (MAX) NOT NULL,
    [SMSRequest]      VARCHAR (MAX) NOT NULL,
    [IsSend]          BIT           NOT NULL,
    [IsReceived]      BIT           NOT NULL,
    [DebtSMSStatusId] INT           NOT NULL,
    [IsActive]        BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]       BIT           NOT NULL,
    [CreatedBy]       VARCHAR (100) NOT NULL,
    [CreatedDate]     DATETIME      NOT NULL,
    [ModifiedBy]      VARCHAR (100) NOT NULL,
    [ModifiedDate]    DATETIME      NOT NULL,
    CONSTRAINT [PK_SMS] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [debt].[trg_AfterAddSMS] ON [debt].[SMS]   
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
Select FinPayeeId,
case when IsSend=1 then 'Send SMS' when IsReceived=1 then 'SMS Received' when IsSend=0 then 'SMS Initiated' END ,
SMSText, 
'',
getdate(),
getdate(),
'',
IsActive, 
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM    inserted