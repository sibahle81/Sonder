CREATE TABLE [legal].[TribunalDetails] (
    [Id]                        INT           IDENTITY (1, 1) NOT NULL,
    [ObjectionId]               INT           NOT NULL,
    [CustomerName]              VARCHAR (250) NOT NULL,
    [DateOfObjection]           DATETIME      NOT NULL,
    [AdvisorId]                 INT           NOT NULL,
    [IsAcknowledge]             BIT           NOT NULL,
    [ObjectionDocument]         VARCHAR (500) NOT NULL,
    [LegalCareTribunalStatusId] INT           NOT NULL,
    [IsActive]                  BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]                 BIT           NOT NULL,
    [CreatedBy]                 VARCHAR (100) NOT NULL,
    [CreatedDate]               DATETIME      NOT NULL,
    [ModifiedBy]                VARCHAR (100) NOT NULL,
    [ModifiedDate]              DATETIME      NOT NULL,
    CONSTRAINT [PK_TribunalDetails] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].trg_AfterUpdate_IsAcknowledge_TribunalDetails
   ON [legal].TribunalDetails
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
				[legal].[actionlog].CreatedBy,[legal].[actionlog].CreatedDate,[legal].[actionlog].ModifiedBy,[legal].[actionlog].ModifiedDate)   
					Select ObjectionId ,
				'Objection acknowledged',
				'', 
				ModifiedBy ,
				getdate(),
				getdate(),
				CustomerName,
				3, 
				'Objection Acknowledged', 
				0,
				ModifiedBy,
				GETDATE(),
				ModifiedBy,
				getdate() 
				FROM inserted

    END 
END
GO
CREATE TRIGGER [legal].trg_AfterUpdate_AssignAdvisor_TribunalDetails
   ON [legal].TribunalDetails
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (AdvisorId) 
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
					Select ObjectionId ,
				'Advisor Assigned',
				'', 
				ModifiedBy ,
				getdate(),
				getdate(),
				CustomerName,
				3, 
				'Advisor Assigned', 
				0,
				ModifiedBy,
				GETDATE(),
				ModifiedBy,
				getdate() 
				FROM inserted

    END 
END