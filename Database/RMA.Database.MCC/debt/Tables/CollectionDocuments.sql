CREATE TABLE [debt].[CollectionDocuments] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [FinPayeeId]        INT            NOT NULL,
    [DocumentId]        INT            NOT NULL,
    [SignedDocumentURL] VARCHAR (1000) NOT NULL,
    [DocumentName]      VARCHAR (150)  NULL,
    [SignedOn]          VARCHAR (100)  NOT NULL,
    [SignedBy]          VARCHAR (100)  NOT NULL,
    [IsActive]          BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]         BIT            NOT NULL,
    [CreatedBy]         VARCHAR (100)  NOT NULL,
    [CreatedDate]       DATETIME       NOT NULL,
    [ModifiedBy]        VARCHAR (100)  NOT NULL,
    [ModifiedDate]      DATETIME       NOT NULL,
    CONSTRAINT [PK_CollectionDocuments] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO


CREATE TRIGGER [debt].trg_AfterDeleteStatus_CollectionDocuments 
   ON [debt].CollectionDocuments
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (IsDeleted) 
    BEGIN
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
				'Document Deleted', 
				isnull(DocumentName,'') +' Deleted', 
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
    END 
END
GO

CREATE TRIGGER [debt].[trg_AfterAddCollectionDocuments] ON [debt].[CollectionDocuments]   
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
'Document Signed',
isnull(DocumentName,'') ,  
'',
getdate(),
getdate(),
isnull(DocumentName,'') , 
IsActive, 
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM    inserted