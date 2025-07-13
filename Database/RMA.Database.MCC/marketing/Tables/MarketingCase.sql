CREATE TABLE [marketing].[MarketingCase] (
    [MarketingCaseId]  INT          IDENTITY (1, 1) NOT NULL,
    [ClaimId]          INT          NOT NULL,
    [AssignedToUserId] INT          NOT NULL,
    [IsActive]         BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]        BIT          DEFAULT ((0)) NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK__marketing_MarketingCase] PRIMARY KEY CLUSTERED ([MarketingCaseId] ASC)
);

