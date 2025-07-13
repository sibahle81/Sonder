CREATE TABLE [claim].[PersonEvent] (
    [PersonEventId]                 INT           NOT NULL,
    [ClaimTypeId]                   INT           NULL,
    [PersonEmploymentId]            INT           NULL,
    [CompanyRolePlayerId]           INT           NULL,
    [PersonEventReferenceNumber]    VARCHAR (50)  NOT NULL,
    [SendBrokerEmail]               BIT           NULL,
    [EventId]                       INT           NOT NULL,
    [InsuredLifeId]                 INT           NOT NULL,
    [ClaimantId]                    INT           NOT NULL,
    [InformantId]                   INT           NULL,
    [PersonEventStatusId]           INT           NOT NULL,
    [PersonEventBucketClassId]      INT           NULL,
    [DateReceived]                  DATETIME      NOT NULL,
    [DateCaptured]                  DATETIME      NOT NULL,
    [CapturedByUserId]              INT           NOT NULL,
    [AssignedDate]                  DATETIME      NULL,
    [AssignedToUserID]              INT           NULL,
    [DateSubmitted]                 DATETIME      NULL,
    [SubmittedByUserId]             INT           NULL,
    [DateAuthorised]                DATETIME      NULL,
    [AuthorisedByUserId]            INT           NULL,
    [DateRejected]                  DATETIME      NULL,
    [RejectedByUserId]              INT           NULL,
    [RejectionReason]               VARCHAR (255) NULL,
    [InsuranceTypeId]               INT           NULL,
    [SuspiciousTransactionStatusId] INT           CONSTRAINT [DF_PersonEvent_SuspiciousTransactionStatus] DEFAULT ((0)) NOT NULL,
    [IsSpectacles]                  BIT           CONSTRAINT [DF_PersonEvent_IsSpectacles] DEFAULT ((0)) NOT NULL,
    [IsDentures]                    BIT           CONSTRAINT [DF_PersonEvent_IsDentures] DEFAULT ((0)) NOT NULL,
    [IsAssault]                     BIT           CONSTRAINT [DF_PersonEvent_IsAssault] DEFAULT ((0)) NOT NULL,
    [IsStraightThroughProcess]      BIT           CONSTRAINT [DF_PersonEvent_IsStraightThroughProcess] DEFAULT ((0)) NOT NULL,
    [IsDeleted]                     BIT           NOT NULL,
    [CreatedBy]                     VARCHAR (50)  NOT NULL,
    [CreatedDate]                   DATETIME      NOT NULL,
    [ModifiedBy]                    VARCHAR (50)  NOT NULL,
    [ModifiedDate]                  DATETIME      NOT NULL,
    [CompCarePersonEventId]         INT           NULL,
    [CompCareIntegrationMessageId]  VARCHAR (350) NULL,
    [CompCarePEVRefNumber]          VARCHAR (350) NULL,
    [DateOfStabilisation]           DATE          NULL,
    [IsFatal]                       BIT           NOT NULL,
    [IsHijack]                      BIT           DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK__Case__3214EC07A658908D] PRIMARY KEY CLUSTERED ([PersonEventId] ASC),
    CONSTRAINT [FK_PersonEvent_ClaimBucketClass] FOREIGN KEY ([PersonEventBucketClassId]) REFERENCES [claim].[ClaimBucketClass] ([ClaimBucketClassId]),
    CONSTRAINT [FK_PersonEvent_ClaimType] FOREIGN KEY ([ClaimTypeId]) REFERENCES [common].[ClaimType] ([Id]),
    CONSTRAINT [FK_PersonEvent_Event] FOREIGN KEY ([EventId]) REFERENCES [claim].[Event] ([EventId]),
    CONSTRAINT [FK_PersonEvent_ParentInsuranceType] FOREIGN KEY ([InsuranceTypeId]) REFERENCES [claim].[ParentInsuranceType] ([ParentInsuranceTypeID]),
    CONSTRAINT [FK_PersonEvent_PersonEmployment] FOREIGN KEY ([PersonEmploymentId]) REFERENCES [client].[PersonEmployment] ([PersonEmpoymentId]),
    CONSTRAINT [FK_PersonEvent_PersonEventStatus] FOREIGN KEY ([PersonEventStatusId]) REFERENCES [common].[PersonEventStatus] ([Id]),
    CONSTRAINT [FK_PersonEvent_RolePlayer] FOREIGN KEY ([CompanyRolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId]),
    CONSTRAINT [FK_PersonEvent_SuspiciousTransactionStatus] FOREIGN KEY ([SuspiciousTransactionStatusId]) REFERENCES [common].[SuspiciousTransactionStatus] ([Id])
);






GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEmploymentId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEmploymentId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEmploymentId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEmploymentId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEmploymentId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEmploymentId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CompanyRolePlayerId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CompanyRolePlayerId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CompanyRolePlayerId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CompanyRolePlayerId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CompanyRolePlayerId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CompanyRolePlayerId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventReferenceNumber'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventReferenceNumber'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventReferenceNumber'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventReferenceNumber'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventReferenceNumber'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventReferenceNumber'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SendBrokerEmail'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SendBrokerEmail'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SendBrokerEmail'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SendBrokerEmail'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SendBrokerEmail'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SendBrokerEmail'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'EventId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'EventId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'EventId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'EventId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'EventId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'EventId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuredLifeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuredLifeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuredLifeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuredLifeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuredLifeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuredLifeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimantId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimantId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimantId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimantId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimantId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ClaimantId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InformantId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InformantId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InformantId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InformantId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InformantId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InformantId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventBucketClassId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventBucketClassId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventBucketClassId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventBucketClassId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventBucketClassId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'PersonEventBucketClassId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateReceived'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateReceived'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateReceived'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateReceived'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateReceived'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateReceived'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateCaptured'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateCaptured'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateCaptured'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateCaptured'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateCaptured'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateCaptured'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CapturedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CapturedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CapturedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CapturedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CapturedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CapturedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedToUserID'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedToUserID'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedToUserID'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedToUserID'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedToUserID'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AssignedToUserID'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateSubmitted'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateSubmitted'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateSubmitted'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateSubmitted'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateSubmitted'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateSubmitted'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SubmittedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SubmittedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SubmittedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SubmittedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SubmittedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SubmittedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateAuthorised'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateAuthorised'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateAuthorised'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateAuthorised'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateAuthorised'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateAuthorised'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AuthorisedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AuthorisedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AuthorisedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AuthorisedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AuthorisedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'AuthorisedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateRejected'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateRejected'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateRejected'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateRejected'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateRejected'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'DateRejected'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectedByUserId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectionReason'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectionReason'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectionReason'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectionReason'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectionReason'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'RejectionReason'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuranceTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuranceTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuranceTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuranceTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuranceTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'InsuranceTypeId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SuspiciousTransactionStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SuspiciousTransactionStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SuspiciousTransactionStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SuspiciousTransactionStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SuspiciousTransactionStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'SuspiciousTransactionStatusId'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsSpectacles'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsSpectacles'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsSpectacles'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsSpectacles'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsSpectacles'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsSpectacles'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDentures'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDentures'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDentures'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDentures'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDentures'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDentures'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsAssault'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsAssault'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsAssault'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsAssault'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsAssault'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsAssault'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsStraightThroughProcess'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsStraightThroughProcess'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsStraightThroughProcess'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsStraightThroughProcess'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsStraightThroughProcess'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsStraightThroughProcess'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDeleted'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDeleted'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDeleted'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDeleted'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDeleted'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'IsDeleted'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'CreatedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedBy'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwner', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'DataOwnerDepartment', @value=N'UnClassified' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'DataSource', @value=N'Modernization' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataClassification', @value=N'Internal' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMADataInformationType', @value=N'Unknown' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedDate'
GO

EXEC sys.sp_addextendedproperty @name=N'RMAIsPOPI', @value=N'No' , @level0type=N'SCHEMA',@level0name=N'claim', @level1type=N'TABLE',@level1name=N'PersonEvent', @level2type=N'COLUMN',@level2name=N'ModifiedDate'
GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_EventId]
    ON [claim].[PersonEvent]([EventId] ASC)
    INCLUDE([InsuredLifeId]);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_CompCarePersonEventId]
    ON [claim].[PersonEvent]([CompCarePersonEventId] ASC)
    INCLUDE([InsuredLifeId], [CompCarePEVRefNumber]);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_CompanyRolePlayerId_CreatedDate]
    ON [claim].[PersonEvent]([CompanyRolePlayerId] ASC, [CreatedDate] ASC)
    INCLUDE([InsuredLifeId]);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_SuspiciousTransactionStatusId_IsStraightThroughProcess_CompCarePersonEventId]
    ON [claim].[PersonEvent]([SuspiciousTransactionStatusId] ASC, [IsStraightThroughProcess] ASC, [CompCarePersonEventId] ASC)
    INCLUDE([EventId], [InsuredLifeId], [ClaimantId], [PersonEventBucketClassId], [CompCarePEVRefNumber]);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_SuspiciousTransactionStatusId_IsStraightThroughProcess]
    ON [claim].[PersonEvent]([SuspiciousTransactionStatusId] ASC, [IsStraightThroughProcess] ASC)
    INCLUDE([CompanyRolePlayerId], [EventId], [InsuredLifeId], [ClaimantId], [PersonEventBucketClassId], [CompCarePEVRefNumber]);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_PersonEventBucketClassId_SuspiciousTransactionStatusId_IsStraightThroughProcess_CompCarePersonEventId]
    ON [claim].[PersonEvent]([PersonEventBucketClassId] ASC, [SuspiciousTransactionStatusId] ASC, [IsStraightThroughProcess] ASC, [CompCarePersonEventId] ASC)
    INCLUDE([EventId], [InsuredLifeId], [ClaimantId], [CompCarePEVRefNumber]);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_PersonEventBucketClassId_SuspiciousTransactionStatusId_IsStraightThroughProcess]
    ON [claim].[PersonEvent]([PersonEventBucketClassId] ASC, [SuspiciousTransactionStatusId] ASC, [IsStraightThroughProcess] ASC)
    INCLUDE([CompanyRolePlayerId], [EventId], [InsuredLifeId], [ClaimantId], [CompCarePEVRefNumber]);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_IsDeleted_CompCarePersonEventId_PersonEventStatusId_CreatedDate]
    ON [claim].[PersonEvent]([IsDeleted] ASC, [CompCarePersonEventId] ASC, [PersonEventStatusId] ASC, [CreatedDate] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEvent_CompanyRolePlayerId]
    ON [claim].[PersonEvent]([CompanyRolePlayerId] ASC)
    INCLUDE([EventId]);

