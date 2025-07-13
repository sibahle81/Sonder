CREATE TABLE [legal].[LegalCareCollection] (
    [Id]                          INT           IDENTITY (1, 1) NOT NULL,
    [FinPayeeId]                  INT           NOT NULL,
    [ManagementTransactionId]     INT           NOT NULL,
    [LegalCareCollectionStatusId] INT           NOT NULL,
    [LastNoticeSentDate]          DATETIME      NOT NULL,
    [AttorneyId]                  INT           NOT NULL,
    [IsSendEmail]                 BIT           NULL,
    [IsActive]                    BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]                   BIT           NOT NULL,
    [CreatedBy]                   VARCHAR (100) NOT NULL,
    [CreatedDate]                 DATETIME      NOT NULL,
    [ModifiedBy]                  VARCHAR (100) NOT NULL,
    [ModifiedDate]                DATETIME      NOT NULL,
    CONSTRAINT [PK_LegalCareCollection] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].trg_AfterAddUpdate_CollectionAttorney_LegalCareCollection
   ON  [legal].LegalCareCollection
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (AttorneyId) 
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
					Select FinPayeeId ,
				'Attorney updated',
				' ', 
				ModifiedBy ,
				getdate(),
				getdate(),
				'',
				2,
				 'Collection Transaction', 
				 0,
				 ModifiedBy,
				 GETDATE(),
				 ModifiedBy,
				 getdate() 
				FROM inserted

    END 
END;