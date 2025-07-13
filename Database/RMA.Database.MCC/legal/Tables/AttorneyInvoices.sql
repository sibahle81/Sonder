CREATE TABLE [legal].[AttorneyInvoices] (
    [Id]                               INT             IDENTITY (1, 1) NOT NULL,
    [InvoiceFile]                      VARCHAR (500)   NOT NULL,
    [Notes]                            VARCHAR (1000)  NULL,
    [LegalCareInvoiceApprovalStatusId] INT             NOT NULL,
    [ReferralId]                       INT             NOT NULL,
    [IsActive]                         BIT             DEFAULT ((1)) NOT NULL,
    [IsDeleted]                        BIT             NOT NULL,
    [CreatedBy]                        VARCHAR (100)   NOT NULL,
    [CreatedDate]                      DATETIME        NOT NULL,
    [ModifiedBy]                       VARCHAR (100)   NOT NULL,
    [ModifiedDate]                     DATETIME        NOT NULL,
    [DocumentId]                       INT             DEFAULT ((0)) NOT NULL,
    [Amount]                           NUMERIC (18, 2) NULL,
    CONSTRAINT [PK_AttorneyInvoices] PRIMARY KEY CLUSTERED ([Id] ASC)
);




GO

CREATE   TRIGGER [legal].[trg_AfterDelete_AttorneyInvoices] ON [legal].[AttorneyInvoices]  
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (IsDeleted) 
    BEGIN
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
					Select ReferralId ,
				'Attorney invoice deleted' ,
				'By '+   ModifiedBy, --(select top(1) [security].[user].UserName  from [security].[user] where [security].[user].Email = ModifiedBy order by 1 desc) , 
				ModifiedBy ,
				getdate(),
				getdate(),
				'',
				1,
				 'Attorney Invoice Deleted', 
				 0,
				 ModifiedBy,
				 GETDATE(),
				 ModifiedBy,
				 getdate() 
				FROM inserted
    END 
END
GO
CREATE TRIGGER [legal].[trg_AfterAdd_AttorneyInvoices] ON [legal].[AttorneyInvoices]   
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
'Attorney invoice uploaded',
Notes,
 CreatedBy ,
 getdate(),
 getdate(),
 '',
 1, 
 'Attorney Invoice',
 0,
 CreatedBy ,
 GETDATE(),
 ModifiedBy,
 getdate() 
FROM    inserted
GO

CREATE   TRIGGER [legal].[trg_AfterAddUpdate_InvoicesApproveReject] ON [legal].[AttorneyInvoices]  
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (LegalCareInvoiceApprovalStatusId) 
    BEGIN
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
					Select ReferralId ,
				'Invoice Updated' ,
				'Invoice ' + (select [common].LegalCareInvoiceApprovalStatus.Name  from [common].LegalCareInvoiceApprovalStatus where [common].LegalCareInvoiceApprovalStatus.Id=LegalCareInvoiceApprovalStatusId),
				ModifiedBy ,
				getdate(),
				getdate(),
				'',
				1,
				 'Invoice Status Change', 
				 0,
				 ModifiedBy,
				 GETDATE(),
				 ModifiedBy,
				 getdate() 
				FROM inserted
    END 
END