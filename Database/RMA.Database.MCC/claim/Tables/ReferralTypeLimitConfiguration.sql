CREATE TABLE [claim].[ReferralTypeLimitConfiguration] (
    [ReferralTypeLimitConfigurationId] INT          IDENTITY (1, 1) NOT NULL,
    [ReferralTypeId]                   INT          NOT NULL,
    [limit]                            DECIMAL (18) NOT NULL,
    [PermissionName]                   VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_ReferralTypeLimitConfiguration] PRIMARY KEY CLUSTERED ([ReferralTypeLimitConfigurationId] ASC),
    CONSTRAINT [FK_ReferralTypeLimitConfiguration_ClaimReferralType] FOREIGN KEY ([ReferralTypeId]) REFERENCES [common].[ClaimReferralType] ([Id])
);

