CREATE TABLE [policy].[PremiumPayback] (
    [PremiumPaybackId]       INT           IDENTITY (1, 1) NOT NULL,
    [PolicyId]               INT           NOT NULL,
    [PremiumPaybackStatusId] INT           NOT NULL,
    [PaybackDate]            DATE          NOT NULL,
    [NotificationSendDate]   DATE          NULL,
    [PaybackFailedReason]    VARCHAR (512) NULL,
    [PremiumPaidDate]        DATE          NULL,
    [PaybackAmount]          MONEY         NULL,
    [IsDeleted]              BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50)  NOT NULL,
    [CreatedDate]            DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50)  NOT NULL,
    [ModifiedDate]           DATETIME      DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([PremiumPaybackId] ASC),
    FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    FOREIGN KEY ([PremiumPaybackStatusId]) REFERENCES [common].[PremiumPaybackStatus] ([Id])
);

