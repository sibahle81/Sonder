CREATE TABLE [bpm].[ReferralTemp] (
    [ReferralId]   INT           IDENTITY (1, 1) NOT NULL,
    [ClaimNumber]  VARCHAR (100) NOT NULL,
    [PolicyNumber] VARCHAR (100) NOT NULL,
    [CustomerName] VARCHAR (250) NOT NULL,
    [Date]         DATETIME      NOT NULL,
    [Status]       VARCHAR (50)  NOT NULL,
    [AssignId]     INT           NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (100) NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (100) NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK_ReferralTemp] PRIMARY KEY CLUSTERED ([ReferralId] ASC)
);

