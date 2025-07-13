CREATE TABLE [policy].[AnnualIncrease] (
    [AnnualIncreaseId]       INT           IDENTITY (1, 1) NOT NULL,
    [PolicyId]               INT           NOT NULL,
    [PolicyIncreaseStatusId] INT           NOT NULL,
    [EffectiveDate]          DATETIME      NOT NULL,
    [NotificationSendDate]   DATETIME      NULL,
    [IncreaseAppliedDate]    DATETIME      NULL,
    [IncreaseFailedReason]   VARCHAR (512) NULL,
    [PremiumBefore]          MONEY         NULL,
    [PremiumAfter]           MONEY         NULL,
    [CoverAmountBefore]      MONEY         NULL,
    [CoverAmountAfter]       MONEY         NULL,
    [IsDeleted]              BIT           CONSTRAINT [DF_AnnualIncrease_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50)  NOT NULL,
    [CreatedDate]            DATETIME      CONSTRAINT [DF_AnnualIncrease_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50)  NOT NULL,
    [ModifiedDate]           DATETIME      CONSTRAINT [DF_AnnualIncrease_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_AnnualIncrease] PRIMARY KEY CLUSTERED ([AnnualIncreaseId] ASC),
    FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK_ConstraintName] FOREIGN KEY ([PolicyIncreaseStatusId]) REFERENCES [common].[PolicyIncreaseStatus] ([Id]),
    CONSTRAINT [UNQ_AnnualIncrease_Policy_EffectiveDate] UNIQUE NONCLUSTERED ([PolicyId] ASC, [EffectiveDate] ASC)
);




GO


GO


GO


GO


GO


GO


