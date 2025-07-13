CREATE TABLE [Load].[PremiumListingMember] (
    [Id]                          INT                                               IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]              UNIQUEIDENTIFIER                                  NOT NULL,
    [ClientReference]             VARCHAR (64)                                      NOT NULL,
    [JoinDate]                    DATE                                              NULL,
    [CoverMemberTypeId]           INT                                               NOT NULL,
    [RolePlayerTypeId]            INT                                               NOT NULL,
    [IdTypeId]                    INT                                               NOT NULL,
    [IdNumber]                    VARCHAR (64) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [MainMemberIdNumber]          VARCHAR (32) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [FirstName]                   VARCHAR (64)                                      NOT NULL,
    [Surname]                     VARCHAR (64)                                      NOT NULL,
    [MemberName]                  VARCHAR (128)                                     NOT NULL,
    [DateOfBirth]                 DATE                                              NULL,
    [Age]                         INT                                               NOT NULL,
    [JoinAge]                     INT                                               NOT NULL,
    [BenefitName]                 VARCHAR (128)                                     NULL,
    [ParentPolicyId]              INT                                               NOT NULL,
    [PolicyId]                    INT                                               NOT NULL,
    [PolicyPremium]               DECIMAL (18, 2)                                   NOT NULL,
    [ExistingCover]               DECIMAL (18, 2)                                   NULL,
    [Multiplier]                  INT                                               NOT NULL,
    [RolePlayerId]                INT                                               NOT NULL,
    [MainMemberRolePlayerId]      INT                                               NOT NULL,
    [BenefitId]                   INT                                               NOT NULL,
    [PolicyExists]                BIT                                               NOT NULL,
    [RolePlayerExists]            BIT                                               NOT NULL,
    [Address1]                    VARCHAR (256)                                     NULL,
    [Address2]                    VARCHAR (256)                                     NULL,
    [City]                        VARCHAR (256)                                     NULL,
    [Province]                    VARCHAR (256)                                     NULL,
    [Country]                     VARCHAR (256)                                     NULL,
    [PostalCode]                  VARCHAR (8)                                       NULL,
    [PostalAddress1]              VARCHAR (256)                                     NULL,
    [PostalAddress2]              VARCHAR (256)                                     NULL,
    [PostalCity]                  VARCHAR (256)                                     NULL,
    [PostalProvince]              VARCHAR (256)                                     NULL,
    [PostalCountry]               VARCHAR (256)                                     NULL,
    [PostalPostCode]              VARCHAR (8)                                       NULL,
    [TelNo]                       VARCHAR (32)                                      NULL,
    [CelNo]                       VARCHAR (32)                                      NULL,
    [Email]                       VARCHAR (128)                                     NULL,
    [PreferredCommunication]      INT                                               NULL,
    [PreviousInsurer]             VARCHAR (128)                                     NULL,
    [PreviousInsurerPolicyNumber] VARCHAR (64)                                      NULL,
    [PreviousInsurerStartDate]    VARCHAR (32)                                      NULL,
    [PreviousInsurerEndDate]      VARCHAR (32)                                      NULL,
    [TestDateOfBirth]             VARCHAR (24)                                      NULL,
    [TestJoinDate]                VARCHAR (24)                                      NULL,
    [MemberStatus]                INT                                               NOT NULL,
    CONSTRAINT [PK__PremiumL__3214EC078B7452BF] PRIMARY KEY CLUSTERED ([Id] ASC)
);






GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_MemberStatus]
    ON [Load].[PremiumListingMember]([MemberStatus] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_BenefitId]
    ON [Load].[PremiumListingMember]([BenefitId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_MainMemberRolePlayerId]
    ON [Load].[PremiumListingMember]([MainMemberRolePlayerId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_RolePlayerId]
    ON [Load].[PremiumListingMember]([RolePlayerId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_PolicyId]
    ON [Load].[PremiumListingMember]([PolicyId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_ParentPolicyId]
    ON [Load].[PremiumListingMember]([ParentPolicyId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_BenefitName]
    ON [Load].[PremiumListingMember]([BenefitName] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_MainMemberIdNumber]
    ON [Load].[PremiumListingMember]([MainMemberIdNumber] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_IdNumber]
    ON [Load].[PremiumListingMember]([IdNumber] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_IdTypeId]
    ON [Load].[PremiumListingMember]([IdTypeId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_RolePlayerTypeId]
    ON [Load].[PremiumListingMember]([RolePlayerTypeId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_CoverMemberTypeId]
    ON [Load].[PremiumListingMember]([CoverMemberTypeId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_ClientReference]
    ON [Load].[PremiumListingMember]([ClientReference] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_PremiumListingMember_FileIdentifier]
    ON [Load].[PremiumListingMember]([FileIdentifier] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestJoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestJoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestJoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestJoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestJoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestJoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestDateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestDateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestDateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestDateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestDateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TestDateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TelNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TelNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TelNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TelNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TelNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'TelNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Surname';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerExists';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerExists';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerExists';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerExists';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerExists';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'RolePlayerExists';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Province';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerStartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerPolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerPolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerPolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerPolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerPolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerPolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurerEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurer';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurer';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurer';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurer';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurer';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreviousInsurer';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreferredCommunication';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreferredCommunication';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreferredCommunication';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreferredCommunication';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreferredCommunication';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PreferredCommunication';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalProvince';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalProvince';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalProvince';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalProvince';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalProvince';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalProvince';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalPostCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalPostCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalPostCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalPostCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalPostCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalPostCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCountry';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCountry';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCountry';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCountry';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCountry';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCountry';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCity';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCity';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCity';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalCity';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PostalAddress1';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyExists';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyExists';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyExists';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyExists';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyExists';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'PolicyExists';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Multiplier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Multiplier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Multiplier';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Multiplier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Multiplier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Multiplier';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MemberName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberIdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberIdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberIdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberIdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberIdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'MainMemberIdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinAge';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'JoinAge';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'RML', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CEO', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'IdNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FirstName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ExistingCover';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ExistingCover';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ExistingCover';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ExistingCover';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ExistingCover';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ExistingCover';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Email';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'DateOfBirth';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CoverMemberTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Country';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'City';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CelNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CelNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CelNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CelNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CelNo';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'CelNo';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'BenefitId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Age';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address2';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address2';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address2';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address2';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address1';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address1';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address1';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'PremiumListingMember', @level2type = N'COLUMN', @level2name = N'Address1';

