CREATE TABLE [legal].[ReferralDetails] (
    [Id]                        INT           IDENTITY (1, 1) NOT NULL,
    [ClaimId]                   INT           NOT NULL,
    [ReferredByUserId]          INT           NOT NULL,
    [Date]                      DATETIME      NOT NULL,
    [LegalCareReferralStatusId] INT           NOT NULL,
    [AssignId]                  INT           NOT NULL,
    [IsActive]                  BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]                 BIT           NOT NULL,
    [CreatedBy]                 VARCHAR (100) NOT NULL,
    [CreatedDate]               DATETIME      NOT NULL,
    [ModifiedBy]                VARCHAR (100) NOT NULL,
    [ModifiedDate]              DATETIME      NOT NULL,
    [IsAcknowledge]             BIT           NULL,
    CONSTRAINT [PK_ReferralDetails] PRIMARY KEY CLUSTERED ([Id] ASC)
);




GO
CREATE TRIGGER legal.trg_AfterAddUpdate_IsAcknowledge_ReferralDetails
   ON [legal].ReferralDetails
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (IsAcknowledge) 
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
					Select Id ,
				'Referral acknowledge',
				ClaimId, 
				ModifiedBy ,
				getdate(),
				getdate(),
				'',
				1, 
				'Referral Details', 
				0,
				ModifiedBy ,
				GETDATE(),
				ModifiedBy,
				getdate() 
				FROM inserted
    END 
END