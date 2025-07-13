CREATE TABLE [policy].[Policy] (
    [PolicyId]                      INT            NOT NULL,
    [TenantId]                      INT            CONSTRAINT [DF_Policy_TenantId] DEFAULT ((1)) NOT NULL,
    [InsurerId]                     INT            CONSTRAINT [DF_Policy_InsurerId] DEFAULT ((1)) NOT NULL,
    [QuoteId]                       INT            NULL,
    [BrokerageId]                   INT            NOT NULL,
    [ProductOptionId]               INT            NOT NULL,
    [RepresentativeId]              INT            NOT NULL,
    [JuristicRepresentativeId]      INT            NULL,
    [PolicyOwnerId]                 INT            NOT NULL,
    [PolicyPayeeId]                 INT            NOT NULL,
    [PaymentFrequencyId]            INT            NULL,
    [PaymentMethodId]               INT            NULL,
    [PolicyNumber]                  VARCHAR (50)   NOT NULL,
    [PolicyInceptionDate]           DATE           NOT NULL,
    [ExpiryDate]                    DATE           NULL,
    [CancellationInitiatedDate]     DATETIME       NULL,
    [CancellationInitiatedBy]       VARCHAR (50)   NULL,
    [CancellationDate]              DATE           NULL,
    [PolicyCancelReasonId]          INT            NULL,
    [FirstInstallmentDate]          DATE           NOT NULL,
    [LastInstallmentDate]           DATE           NULL,
    [RegularInstallmentDayOfMonth]  INT            NULL,
    [DecemberInstallmentDayOfMonth] INT            NULL,
    [PolicyStatusId]                INT            NOT NULL,
    [AnnualPremium]                 MONEY          NOT NULL,
    [InstallmentPremium]            MONEY          NOT NULL,
    [AdminPercentage]               DECIMAL (5, 4) CONSTRAINT [DF_Policy_AdminPercentage] DEFAULT ((0.00)) NOT NULL,
    [CommissionPercentage]          DECIMAL (5, 4) CONSTRAINT [DF_Policy_CommissionPercentage] DEFAULT ((0.00)) NOT NULL,
    [BinderFeePercentage]           DECIMAL (5, 4) CONSTRAINT [DF_Policy_BinderFeePercentage] DEFAULT ((0.00)) NOT NULL,
    [PremiumAdjustmentPercentage]   DECIMAL (6, 4) CONSTRAINT [DF_Policy_PremiumAdjustmentPercentage] DEFAULT ((0)) NOT NULL,
    [ClientReference]               VARCHAR (50)   NULL,
    [LastLapsedDate]                DATE           NULL,
    [LapsedCount]                   INT            NULL,
    [LastReinstateDate]             DATE           NULL,
    [ReinstateReasonId]             INT            NULL,
    [PolicyMovementId]              INT            NULL,
    [ParentPolicyId]                INT            NULL,
    [PolicyPauseDate]               DATETIME       NULL,
    [CanLapse]                      BIT            CONSTRAINT [DF_Policy_CanLapse] DEFAULT ((1)) NOT NULL,
    [IsEuropAssist]                 BIT            CONSTRAINT [DF_Policy_IsEuropAssist] DEFAULT ((0)) NOT NULL,
    [EuropAssistEffectiveDate]      DATE           NULL,
    [EuropAssistEndDate]            DATE           NULL,
    [IsDeleted]                     BIT            NOT NULL,
    [CreatedBy]                     VARCHAR (50)   NOT NULL,
    [CreatedDate]                   DATETIME       NOT NULL,
    [ModifiedBy]                    VARCHAR (50)   NOT NULL,
    [ModifiedDate]                  DATETIME       NOT NULL,
    CONSTRAINT [PK__Policy__3214EC07A780648E] PRIMARY KEY CLUSTERED ([PolicyId] ASC),
    CONSTRAINT [FK_Policy_Brokerage] FOREIGN KEY ([BrokerageId]) REFERENCES [broker].[Brokerage] ([Id]),
    CONSTRAINT [FK_Policy_Insurer] FOREIGN KEY ([InsurerId]) REFERENCES [policy].[Insurer] ([Id]),
    CONSTRAINT [FK_Policy_PaymentFrequency] FOREIGN KEY ([PaymentFrequencyId]) REFERENCES [common].[PaymentFrequency] ([Id]),
    CONSTRAINT [FK_Policy_PaymentMethod] FOREIGN KEY ([PaymentMethodId]) REFERENCES [common].[PaymentMethod] ([Id]),
    CONSTRAINT [FK_Policy_Policy] FOREIGN KEY ([ParentPolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK_Policy_PolicyCancelReason] FOREIGN KEY ([PolicyCancelReasonId]) REFERENCES [common].[PolicyCancelReason] ([Id]),
    CONSTRAINT [FK_Policy_PolicyMovements] FOREIGN KEY ([PolicyMovementId]) REFERENCES [policy].[PolicyMovements] ([PolicyMovementId]),
    CONSTRAINT [FK_Policy_PolicyStatus] FOREIGN KEY ([PolicyStatusId]) REFERENCES [common].[PolicyStatus] ([Id]),
    CONSTRAINT [FK_Policy_ProductOption] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id]),
    CONSTRAINT [FK_Policy_Quote_V2] FOREIGN KEY ([QuoteId]) REFERENCES [quote].[Quote_V2] ([QuoteId]),
    CONSTRAINT [FK_Policy_ReinstateReason] FOREIGN KEY ([ReinstateReasonId]) REFERENCES [common].[ReinstateReason] ([Id]),
    CONSTRAINT [FK_Policy_Representative] FOREIGN KEY ([RepresentativeId]) REFERENCES [broker].[Representative] ([Id]),
    CONSTRAINT [FK_Policy_Representative1] FOREIGN KEY ([JuristicRepresentativeId]) REFERENCES [broker].[Representative] ([Id]),
    CONSTRAINT [FK_Policy_RolePlayer] FOREIGN KEY ([PolicyOwnerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId]),
    CONSTRAINT [FK_Policy_RolePlayer1] FOREIGN KEY ([PolicyPayeeId]) REFERENCES [client].[RolePlayer] ([RolePlayerId]),
    CONSTRAINT [FK_Policy_Tenant] FOREIGN KEY ([TenantId]) REFERENCES [security].[Tenant] ([Id])
);




















GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO


GO
CREATE UNIQUE NONCLUSTERED INDEX [uidx_policy_number]
    ON [policy].[Policy]([PolicyNumber] ASC);


GO
CREATE UNIQUE NONCLUSTERED INDEX [uidx_policy_clientreference]
    ON [policy].[Policy]([ClientReference] ASC) WHERE ([ClientReference] IS NOT NULL);


GO
CREATE NONCLUSTERED INDEX [PolicyBrokerageIdIndex]
    ON [policy].[Policy]([BrokerageId] ASC, [IsDeleted] ASC)
    INCLUDE([ProductOptionId]);


GO
CREATE NONCLUSTERED INDEX [Policy_policyOwnerId]
    ON [policy].[Policy]([PolicyOwnerId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_policy_number]
    ON [policy].[Policy]([PolicyNumber] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ReinstateReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ReinstateReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ReinstateReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ReinstateReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ReinstateReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ReinstateReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RegularInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RegularInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RegularInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RegularInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RegularInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'RegularInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'QuoteId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ProductOptionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PremiumAdjustmentPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PremiumAdjustmentPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PremiumAdjustmentPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PremiumAdjustmentPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PremiumAdjustmentPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PremiumAdjustmentPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPayeeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPauseDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPauseDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPauseDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPauseDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPauseDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyPauseDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyOwnerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyMovementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyMovementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyMovementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyMovementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyMovementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyMovementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyInceptionDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyCancelReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyCancelReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyCancelReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyCancelReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyCancelReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PolicyCancelReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentMethodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'PaymentFrequencyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ParentPolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastReinstateDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastReinstateDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastReinstateDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastReinstateDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastReinstateDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastReinstateDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastLapsedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastLapsedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastLapsedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastLapsedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastLapsedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastLapsedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LastInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LapsedCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LapsedCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LapsedCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LapsedCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LapsedCount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'LapsedCount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'JuristicRepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'JuristicRepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'JuristicRepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'JuristicRepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'JuristicRepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'JuristicRepresentativeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsEuropAssist';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsEuropAssist';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsEuropAssist';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsEuropAssist';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsEuropAssist';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsEuropAssist';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InsurerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InsurerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InsurerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InsurerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InsurerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InsurerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'InstallmentPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'FirstInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'FirstInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'FirstInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'FirstInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'FirstInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'FirstInstallmentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ExpiryDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ExpiryDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ExpiryDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ExpiryDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ExpiryDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ExpiryDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'EuropAssistEffectiveDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'DecemberInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'DecemberInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'DecemberInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'DecemberInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'DecemberInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'DecemberInstallmentDayOfMonth';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CommissionPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'ClientReference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CanLapse';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CanLapse';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CanLapse';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CanLapse';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CanLapse';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CanLapse';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationInitiatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'CancellationDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BrokerageId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'BinderFeePercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Operations', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'COO', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AnnualPremium';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'Policy', @level2type = N'COLUMN', @level2name = N'AdminPercentage';


GO
CREATE NONCLUSTERED INDEX [IX_Policy_ParentPolicyId_IsDeleted_PolicyStatusId_FA6FB]
    ON [policy].[Policy]([ParentPolicyId] ASC, [IsDeleted] ASC, [PolicyStatusId] ASC)
    INCLUDE([TenantId], [InsurerId], [QuoteId], [BrokerageId], [ProductOptionId], [RepresentativeId], [JuristicRepresentativeId], [PolicyOwnerId], [PolicyPayeeId], [PaymentFrequencyId], [PaymentMethodId], [PolicyNumber], [PolicyInceptionDate], [ExpiryDate], [CancellationInitiatedDate], [CancellationInitiatedBy], [CancellationDate], [PolicyCancelReasonId], [FirstInstallmentDate], [LastInstallmentDate], [RegularInstallmentDayOfMonth], [DecemberInstallmentDayOfMonth], [AnnualPremium], [InstallmentPremium], [AdminPercentage], [CommissionPercentage], [BinderFeePercentage], [PremiumAdjustmentPercentage], [ClientReference], [LastLapsedDate], [LapsedCount], [LastReinstateDate], [ReinstateReasonId], [PolicyMovementId], [PolicyPauseDate], [CanLapse], [IsEuropAssist], [EuropAssistEffectiveDate], [EuropAssistEndDate], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]);


GO
CREATE NONCLUSTERED INDEX [IX_Policy_ParentPolicyId_IsDeleted_PolicyStatusId_307BB]
    ON [policy].[Policy]([ParentPolicyId] ASC, [IsDeleted] ASC, [PolicyStatusId] ASC)
    INCLUDE([TenantId], [PolicyNumber]);


GO
CREATE NONCLUSTERED INDEX [IX_Policy_PolicyPayeeId]
    ON [policy].[Policy]([PolicyPayeeId] ASC)
    INCLUDE([TenantId], [InsurerId], [QuoteId], [BrokerageId], [ProductOptionId], [RepresentativeId], [JuristicRepresentativeId], [PolicyOwnerId], [PaymentFrequencyId], [PaymentMethodId], [PolicyNumber], [PolicyInceptionDate], [ExpiryDate], [CancellationInitiatedDate], [CancellationInitiatedBy], [CancellationDate], [PolicyCancelReasonId], [FirstInstallmentDate], [LastInstallmentDate], [RegularInstallmentDayOfMonth], [DecemberInstallmentDayOfMonth], [PolicyStatusId], [AnnualPremium], [InstallmentPremium], [AdminPercentage], [CommissionPercentage], [BinderFeePercentage], [PremiumAdjustmentPercentage], [ClientReference], [LastLapsedDate], [LapsedCount], [LastReinstateDate], [ReinstateReasonId], [PolicyMovementId], [ParentPolicyId], [PolicyPauseDate], [CanLapse], [IsEuropAssist], [EuropAssistEffectiveDate], [EuropAssistEndDate], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]);


GO
CREATE NONCLUSTERED INDEX [IX_Policy_IsDeleted]
    ON [policy].[Policy]([IsDeleted] ASC)
    INCLUDE([TenantId], [PolicyOwnerId], [PolicyNumber], [ClientReference]);


GO
CREATE NONCLUSTERED INDEX [IX_Policy_InsurerId]
    ON [policy].[Policy]([InsurerId] ASC)
    INCLUDE([TenantId], [QuoteId], [BrokerageId], [ProductOptionId], [RepresentativeId], [JuristicRepresentativeId], [PolicyOwnerId], [PolicyPayeeId], [PaymentFrequencyId], [PaymentMethodId], [PolicyNumber], [PolicyInceptionDate], [ExpiryDate], [CancellationInitiatedDate], [CancellationInitiatedBy], [CancellationDate], [PolicyCancelReasonId], [FirstInstallmentDate], [LastInstallmentDate], [RegularInstallmentDayOfMonth], [DecemberInstallmentDayOfMonth], [PolicyStatusId], [AnnualPremium], [InstallmentPremium], [AdminPercentage], [CommissionPercentage], [BinderFeePercentage], [PremiumAdjustmentPercentage], [ClientReference], [LastLapsedDate], [LapsedCount], [LastReinstateDate], [ReinstateReasonId], [PolicyMovementId], [ParentPolicyId], [PolicyPauseDate], [CanLapse], [IsEuropAssist], [EuropAssistEffectiveDate], [EuropAssistEndDate], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]);


GO
CREATE   TRIGGER [policy].[UpdateInstallmentPremiumTrigger] 
	ON [policy].[Policy]
	AFTER UPDATE
AS BEGIN
	declare @oldPremium money
	declare @newPremium money
	declare @policyNumber varchar(32)
	declare @modifiedBy varchar(128)

	set nocount on

	select @oldPremium = InstallmentPremium from deleted
	select @policyNumber = PolicyNumber, @newPremium = InstallmentPremium, @modifiedBy = ModifiedBy from inserted

	if left(@policyNumber, 3) = '01-' and @modifiedBy = 'system@randmutual.co.za' begin
		if @newPremium < @oldPremium / 10.0 begin
			set nocount off
			raiserror('The new premium may be incorrect, because it is a lot less than the old premium.', 11, 1)
		end
	end

	set nocount off
END
GO
CREATE NONCLUSTERED INDEX [IX_Policy_BrokerageId]
    ON [policy].[Policy]([BrokerageId] ASC)
    INCLUDE([ParentPolicyId]);


GO
CREATE NONCLUSTERED INDEX [IX_Policy_PolicyMovementId]
    ON [policy].[Policy]([PolicyMovementId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Policy_ParentPolicyId_IsDeleted]
    ON [policy].[Policy]([ParentPolicyId] ASC, [IsDeleted] ASC)
    INCLUDE([TenantId], [InsurerId], [QuoteId], [BrokerageId], [ProductOptionId], [RepresentativeId], [JuristicRepresentativeId], [PolicyOwnerId], [PolicyPayeeId], [PaymentFrequencyId], [PaymentMethodId], [PolicyNumber], [PolicyInceptionDate], [ExpiryDate], [CancellationInitiatedDate], [CancellationInitiatedBy], [CancellationDate], [PolicyCancelReasonId], [FirstInstallmentDate], [LastInstallmentDate], [RegularInstallmentDayOfMonth], [DecemberInstallmentDayOfMonth], [PolicyStatusId], [AnnualPremium], [InstallmentPremium], [AdminPercentage], [CommissionPercentage], [BinderFeePercentage], [PremiumAdjustmentPercentage], [ClientReference], [LastLapsedDate], [LapsedCount], [LastReinstateDate], [ReinstateReasonId], [PolicyMovementId], [PolicyPauseDate], [CanLapse], [IsEuropAssist], [EuropAssistEffectiveDate], [EuropAssistEndDate], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]);


GO
CREATE NONCLUSTERED INDEX [IX_Policy_JuristicRepresentativeId_IsDeleted]
    ON [policy].[Policy]([JuristicRepresentativeId] ASC, [IsDeleted] ASC)
    INCLUDE([TenantId]);

