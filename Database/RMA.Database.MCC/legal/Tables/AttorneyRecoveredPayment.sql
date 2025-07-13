CREATE TABLE [legal].[AttorneyRecoveredPayment] (
    [Id]              INT             IDENTITY (1, 1) NOT NULL,
    [ReferralId]      INT             NOT NULL,
    [File]            VARCHAR (500)   NOT NULL,
    [Amount]          NUMERIC (18, 2) NOT NULL,
    [Date]            DATETIME        NOT NULL,
    [CapitalAmount]   NUMERIC (18, 2) NOT NULL,
    [ContigencyFees]  NUMERIC (18, 2) NOT NULL,
    [DisbursedAmount] NUMERIC (18, 2) NOT NULL,
    [RmaAmount]       NUMERIC (18, 2) NOT NULL,
    [Notes]           VARCHAR (1000)  NULL,
    [IsActive]        BIT             DEFAULT ((1)) NOT NULL,
    [IsDeleted]       BIT             NOT NULL,
    [CreatedBy]       VARCHAR (100)   NOT NULL,
    [CreatedDate]     DATETIME        NOT NULL,
    [ModifiedBy]      VARCHAR (100)   NOT NULL,
    [ModifiedDate]    DATETIME        NOT NULL,
    [DocumentId]      INT             DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_AttorneyRecoveredPayment] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE TRIGGER [legal].[trg_AfterAdd_AttorneyRecoveredPayment] ON [legal].[AttorneyRecoveredPayment]   
FOR INSERT
AS 
insert into [legal].[actionlog]   
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
Select ReferralId
,'Attorney payment added',
Notes , 
CreatedBy ,
getdate(),
getdate(),
'',
1, 
'Attorney Payments',
0,
CreatedBy ,
GETDATE(),
ModifiedBy,
getdate() 
FROM    inserted;