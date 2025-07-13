CREATE TABLE [debt].[TransactionCollectionStatus] (
    [Id]                     INT            IDENTITY (1, 1) NOT NULL,
    [FinPayeeId]             INT            NOT NULL,
    [CollectionStatusCodeId] INT            NOT NULL,
    [CollectionStatusName]   VARCHAR (100)  NOT NULL,
    [NextActionDate]         DATETIME       NOT NULL,
    [TransferToDepartmentId] INT            NOT NULL,
    [TransfertToUserId]      INT            NOT NULL,
    [PTPCount]               INT            NOT NULL,
    [Note]                   VARCHAR (1000) NOT NULL,
    [IsActive]               BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]              BIT            NOT NULL,
    [CreatedBy]              VARCHAR (100)  NOT NULL,
    [CreatedDate]            DATETIME       NOT NULL,
    [ModifiedBy]             VARCHAR (100)  NOT NULL,
    [ModifiedDate]           DATETIME       NOT NULL,
    CONSTRAINT [PK_TransactionCollectionStatus] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UC_TransactionCollectionStatus] UNIQUE NONCLUSTERED ([FinPayeeId] ASC)
);


GO
CREATE TRIGGER [debt].[trg_AfterAdd_TransactionCollectionStatus] ON [debt].[TransactionCollectionStatus]   
FOR INSERT 
AS  
insert into [debt].[ActionLogs]   
				([debt].[ActionLogs].FinPayeeId,
				[debt].[ActionLogs].LogTitle,
				[debt].[ActionLogs].Description ,
				[debt].[ActionLogs].AgentId ,
				[debt].[ActionLogs].AssignDate,
				[debt].[ActionLogs].AssignTime,
				[debt].[ActionLogs].ActionType,
				[debt].[ActionLogs].IsActive,
				[debt].[ActionLogs].IsDeleted,
				[debt].[ActionLogs].CreatedBy,
				[debt].[ActionLogs].CreatedDate,
				[debt].[ActionLogs].ModifiedBy,
				[debt].[ActionLogs].ModifiedDate)   
Select FinPayeeId ,
			CollectionStatusName,
			Note, 
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
	   FROM inserted
GO
CREATE TRIGGER [debt].trg_AfterAddUpdate_CollectionStatus_TransactionCollectionStatus 
   ON [debt].TransactionCollectionStatus
   FOR UPDATE
AS  
insert into [debt].[ActionLogs]   
				([debt].[ActionLogs].FinPayeeId,
				[debt].[ActionLogs].LogTitle,
				[debt].[ActionLogs].Description ,
				[debt].[ActionLogs].AgentId ,
				[debt].[ActionLogs].AssignDate,
				[debt].[ActionLogs].AssignTime,
				[debt].[ActionLogs].ActionType,
				[debt].[ActionLogs].IsActive,
				[debt].[ActionLogs].IsDeleted,
				[debt].[ActionLogs].CreatedBy,
				[debt].[ActionLogs].CreatedDate,
				[debt].[ActionLogs].ModifiedBy,
				[debt].[ActionLogs].ModifiedDate)   
	Select FinPayeeId ,
			CollectionStatusName,
			Note, 
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
	   FROM inserted