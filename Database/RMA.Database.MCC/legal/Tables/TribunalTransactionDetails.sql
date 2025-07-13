CREATE TABLE [legal].[TribunalTransactionDetails] (
    [Id]                  INT             IDENTITY (1, 1) NOT NULL,
    [ReferralId]          INT             NOT NULL,
    [IsPotentialRecovery] BIT             NULL,
    [AssignAdvisorId]     INT             NULL,
    [PotentialNotes]      VARCHAR (1000)  NULL,
    [UpdateStatusNote]    VARCHAR (1000)  NULL,
    [UpdateStatusId]      INT             NULL,
    [UploadCourtOrder]    VARCHAR (500)   NULL,
    [OfferAmount]         NUMERIC (18, 2) NULL,
    [IsActive]            BIT             DEFAULT ((1)) NOT NULL,
    [IsDeleted]           BIT             NOT NULL,
    [CreatedBy]           VARCHAR (100)   NOT NULL,
    [CreatedDate]         DATETIME        NOT NULL,
    [ModifiedBy]          VARCHAR (100)   NOT NULL,
    [ModifiedDate]        DATETIME        NOT NULL,
    CONSTRAINT [PK_TribunalTransactionDetails] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_TribunalTransactionDetails] UNIQUE NONCLUSTERED ([ReferralId] ASC)
);

