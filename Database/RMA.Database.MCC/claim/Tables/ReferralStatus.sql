CREATE TABLE [claim].[ReferralStatus] (
    [ReferralStatusID] INT           IDENTITY (1, 1) NOT NULL,
    [Name]             VARCHAR (50)  NOT NULL,
    [Description]      VARCHAR (250) NULL,
    CONSTRAINT [PK_Claim_ReferralStatus_ReferralStatusID ] PRIMARY KEY CLUSTERED ([ReferralStatusID] ASC)
);

