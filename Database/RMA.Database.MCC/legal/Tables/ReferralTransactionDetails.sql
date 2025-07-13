CREATE TABLE [legal].[ReferralTransactionDetails] (
    [Id]                              INT             IDENTITY (1, 1) NOT NULL,
    [ReferralId]                      INT             NOT NULL,
    [IsPotentialRecovery]             BIT             NULL,
    [AssignAdvisorId]                 INT             NULL,
    [PotentialNotes]                  VARCHAR (1000)  NULL,
    [UpdateStatusNote]                VARCHAR (1000)  NULL,
    [LegalCareReferralUpdateStatusId] INT             NULL,
    [UploadCourtOrder]                VARCHAR (500)   NULL,
    [OfferAmount]                     NUMERIC (18, 2) NULL,
    [IsActive]                        BIT             DEFAULT ((1)) NOT NULL,
    [IsDeleted]                       BIT             NOT NULL,
    [CreatedBy]                       VARCHAR (100)   NOT NULL,
    [CreatedDate]                     DATETIME        NOT NULL,
    [ModifiedBy]                      VARCHAR (100)   NOT NULL,
    [ModifiedDate]                    DATETIME        NOT NULL,
    CONSTRAINT [PK_ReferralTransactionDetails] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [chk1] CHECK ([ReferralId]<>(0)),
    CONSTRAINT [AK_ReferralTransactionDetails] UNIQUE NONCLUSTERED ([ReferralId] ASC)
);




GO
CREATE   TRIGGER legal.trg_AfterAddUpdate_UpdateStatus_ReferralTransactionDetails
   ON [legal].ReferralTransactionDetails
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (LegalCareReferralUpdateStatusId) 
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
				'Recovery status updated' ,
				UpdateStatusNote, 
				ModifiedBy ,
				getdate(),
				getdate(),
				'',
				1, 
				'Recovery Status Update ', 
				0
				,ModifiedBy ,
				GETDATE(),
				ModifiedBy,
				getdate() 
				FROM inserted    
	END 
END
GO
CREATE TRIGGER legal.trg_AfterAddUpdate_PotentialRecovery_ReferralTransactionDetails
   ON [legal].ReferralTransactionDetails
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (IsPotentialRecovery) 
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
				[legal].[actionlog].CreatedBy,[legal].[actionlog].CreatedDate,[legal].[actionlog].ModifiedBy,[legal].[actionlog].ModifiedDate)   
					Select ReferralId ,
				'Potential recovery has been added -'+ ' '+ case when IsPotentialRecovery=0 then '(No)' when IsPotentialRecovery=1 then '(Yes)' End,
				PotentialNotes, 
				ModifiedBy ,
				getdate(),
				getdate(),
				'',
				1, 
				'Potential Recovery', 
				0,
				ModifiedBy ,
				GETDATE(),
				ModifiedBy,
				getdate() 
				FROM inserted
    END 
END
GO
CREATE TRIGGER [legal].[trg_AfterAdd_ReferralTransactionDetails] ON [legal].[ReferralTransactionDetails]   
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
[legal].[actionlog].CreatedBy,[legal].[actionlog].CreatedDate,[legal].[actionlog].ModifiedBy,[legal].[actionlog].ModifiedDate)   
Select ReferralId ,
'Referral Transaction Add',
PotentialNotes, 
CreatedBy ,
getdate(),
getdate(),
'',
1,
'Referral Transaction',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted
GO
CREATE TRIGGER legal.trg_AfterAddUpdate_AssignAdvisor_ReferralTransactionDetails
   ON  [legal].ReferralTransactionDetails
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (AssignAdvisorId) 
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
				'Recovery consultant updated',
				PotentialNotes, 
				ModifiedBy,
				getdate(),
				getdate(),
				'',
				1,
				 'Referral Transaction', 
				 0,
				 ModifiedBy,
				 GETDATE(),
				 ModifiedBy,
				 getdate() 
				FROM inserted

    END 
END