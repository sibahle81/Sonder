CREATE TABLE [Load].[PremiumListingMember] (
    [Id]                       INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]           UNIQUEIDENTIFIER NOT NULL,
    [ClientReference]          VARCHAR (64)     NOT NULL,
    [JoinDate]                 DATE             NULL,
    [CoverMemberTypeId]        INT              NOT NULL,
    [RolePlayerTypeId]         INT              NOT NULL,
    [IdTypeId]                 INT              NOT NULL,
    [IdNumber]                 VARCHAR (64)     NOT NULL,
    [MainMemberIdNumber]       VARCHAR (32)     NOT NULL,
    [FirstName]                VARCHAR (64)     NOT NULL,
    [Surname]                  VARCHAR (64)     NOT NULL,
    [MemberName]               VARCHAR (128)    NOT NULL,
    [DateOfBirth]              DATE             NULL,
    [Age]                      INT              NOT NULL,
    [JoinAge]                  INT              NOT NULL,
    [BenefitName]              VARCHAR (64)     NULL,
    [ParentPolicyId]           INT              NOT NULL,
    [PolicyId]                 INT              NOT NULL,
    [PolicyPremium]            DECIMAL (18, 2)  NOT NULL,
    [ExistingCover]            DECIMAL (18, 2)  NULL,
    [Multiplier]               INT              NOT NULL,
    [RolePlayerId]             INT              NOT NULL,
    [MainMemberRolePlayerId]   INT              NOT NULL,
    [BenefitId]                INT              NOT NULL,
    [PolicyExists]             BIT              NOT NULL,
    [RolePlayerExists]         BIT              NOT NULL,
    [Address1]                 VARCHAR (256)    NULL,
    [Address2]                 VARCHAR (256)    NULL,
    [City]                     VARCHAR (256)    NULL,
    [Province]                 VARCHAR (256)    NULL,
    [Country]                  VARCHAR (256)    NULL,
    [PostalCode]               VARCHAR (8)      NULL,
    [PostalAddress1]           VARCHAR (256)    NULL,
    [PostalAddress2]           VARCHAR (256)    NULL,
    [PostalCity]               VARCHAR (256)    NULL,
    [PostalProvince]           VARCHAR (256)    NULL,
    [PostalCountry]            VARCHAR (256)    NULL,
    [PostalPostCode]           VARCHAR (8)      NULL,
    [TelNo]                    VARCHAR (32)     NULL,
    [CelNo]                    VARCHAR (32)     NULL,
    [Email]                    VARCHAR (128)    NULL,
    [PreferredCommunication]   INT              NULL,
    [PreviousInsurer]          VARCHAR (128)    NULL,
    [PreviousInsurerStartDate] VARCHAR (32)     NULL,
    [PreviousInsurerEndDate]   VARCHAR (32)     NULL,
    [TestDateOfBirth]          VARCHAR (24)     NULL,
    [TestJoinDate]             VARCHAR (24)     NULL,
    [MemberStatus]             INT              NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_BenefitId]
    ON [Load].[PremiumListingMember]([BenefitId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_BenefitName]
    ON [Load].[PremiumListingMember]([BenefitName] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_ClientReference]
    ON [Load].[PremiumListingMember]([ClientReference] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_CoverMemberTypeId]
    ON [Load].[PremiumListingMember]([CoverMemberTypeId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_FileIdentifier]
    ON [Load].[PremiumListingMember]([FileIdentifier] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_IdNumber]
    ON [Load].[PremiumListingMember]([IdNumber] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_IdTypeId]
    ON [Load].[PremiumListingMember]([IdTypeId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_MainMemberIdNumber]
    ON [Load].[PremiumListingMember]([MainMemberIdNumber] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_MainMemberRolePlayerId]
    ON [Load].[PremiumListingMember]([MainMemberRolePlayerId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_MemberStatus]
    ON [Load].[PremiumListingMember]([MemberStatus] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_ParentPolicyId]
    ON [Load].[PremiumListingMember]([ParentPolicyId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_PolicyId]
    ON [Load].[PremiumListingMember]([PolicyId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_RolePlayerId]
    ON [Load].[PremiumListingMember]([RolePlayerId] ASC);
GO

CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_RolePlayerTypeId]
    ON [Load].[PremiumListingMember]([RolePlayerTypeId] ASC);
GO

