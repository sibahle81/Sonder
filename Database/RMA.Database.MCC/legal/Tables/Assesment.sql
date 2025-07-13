CREATE TABLE [legal].[Assesment] (
    [Id]                                 INT            IDENTITY (1, 1) NOT NULL,
    [ObjectionId]                        INT            NOT NULL,
    [LegalCareAssesmentDecisionStatusId] INT            NOT NULL,
    [DepartmentId]                       INT            NOT NULL,
    [AssignId]                           INT            NULL,
    [Notes]                              VARCHAR (1000) NOT NULL,
    [IsActive]                           BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]                          BIT            NOT NULL,
    [CreatedBy]                          VARCHAR (100)  NOT NULL,
    [CreatedDate]                        DATETIME       NOT NULL,
    [ModifiedBy]                         VARCHAR (100)  NOT NULL,
    [ModifiedDate]                       DATETIME       NOT NULL,
    CONSTRAINT [PK_Assesment] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE  TRIGGER [legal].[trg_AfterAdd_Assesment] ON [legal].[Assesment]   
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
[legal].[actionlog].CreatedBy,
[legal].[actionlog].CreatedDate,
[legal].[actionlog].ModifiedBy,
[legal].[actionlog].ModifiedDate)   
Select ObjectionId ,
'Assesment Updated' + ' - '+ case when LegalCareAssesmentDecisionStatusId=1 then 'Referred Back' when  LegalCareAssesmentDecisionStatusId=2 then 'Trial Ready' end ,
Notes, 
CreatedBy ,
getdate(),
getdate(),
'',
3, 
'Assesment Updated',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM inserted
GO
CREATE TRIGGER legal.trg_AfterAddUpdate_AssessmentDecision_Assesment 
   ON [legal].Assesment
   AFTER UPDATE
AS BEGIN
    SET NOCOUNT ON;
    IF UPDATE (LegalCareAssesmentDecisionStatusId) 
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
				'Assesment Updated' + ' - '+ case when LegalCareAssesmentDecisionStatusId=1 then '(Referred Back)' when  LegalCareAssesmentDecisionStatusId=2 then '(Trial Ready)' end ,
				Notes, 
				ModifiedBy ,
				getdate(),
				getdate(),
				'CustomerName',
				3, 
				'Assesment Updated', 
				0,
				ModifiedBy ,
				GETDATE(),
				ModifiedBy,
				getdate() 
				FROM inserted			
    END 
END