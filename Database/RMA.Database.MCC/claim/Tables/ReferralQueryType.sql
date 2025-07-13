CREATE TABLE [claim].[ReferralQueryType] (
    [ReferralQueryTypeID]    INT           IDENTITY (1, 1) NOT NULL,
    [Name]                   VARCHAR (100) NOT NULL,
    [isActive]               BIT           DEFAULT ((0)) NOT NULL,
    [DepartmentID]           INT           NULL,
    [PriorityID]             INT           NULL,
    [FirstLineSupportRoleId] INT           NULL,
    [CreatedBy]              VARCHAR (100) NOT NULL,
    [CreatedDate]            DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (100) NOT NULL,
    [ModifiedDate]           DATETIME      DEFAULT (getdate()) NOT NULL,
    [WizardConfigurationId]  INT           NULL,
    CONSTRAINT [PK_claim_ReferralQueryType_ReferralQueryTypeID] PRIMARY KEY CLUSTERED ([ReferralQueryTypeID] ASC)
);

