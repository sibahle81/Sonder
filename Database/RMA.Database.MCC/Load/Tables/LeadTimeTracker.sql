CREATE TABLE [Load].[LeadTimeTracker] (
    [LeadTimeTrackerId]        INT           IDENTITY (1, 1) NOT NULL,
    [ServiceBusMessageId]      VARCHAR (100) NOT NULL,
    [LeadClaimReference]       VARCHAR (100) NOT NULL,
    [LeadSubmitDate]           DATETIME      NOT NULL,
    [LeadApiReceivedDate]      DATETIME      NOT NULL,
    [LeadServiceBusQueuedDate] DATETIME      NOT NULL,
    [WizardId]                 INT           NULL,
    [PolicyId]                 INT           NULL,
    [QLinkTransactionId]       INT           NULL,
    [IsDeleted]                BIT           DEFAULT ((0)) NOT NULL,
    [CreatedDate]              DATETIME      DEFAULT (getdate()) NOT NULL,
    [CreatedBy]                VARCHAR (50)  NOT NULL,
    [ModifiedDate]             DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]               VARCHAR (50)  NOT NULL,
    PRIMARY KEY CLUSTERED ([LeadTimeTrackerId] ASC)
);

