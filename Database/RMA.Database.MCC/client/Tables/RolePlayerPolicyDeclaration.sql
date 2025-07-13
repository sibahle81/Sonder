CREATE TABLE [client].[RolePlayerPolicyDeclaration] (
    [RolePlayerPolicyDeclarationId]       INT              IDENTITY (1, 1) NOT NULL,
    [TenantId]                            INT              NOT NULL,
    [RolePlayerId]                        INT              NOT NULL,
    [PolicyId]                            INT              NOT NULL,
    [RolePlayerPolicyDeclarationStatusId] INT              NOT NULL,
    [RolePlayerPolicyDeclarationTypeId]   INT              NOT NULL,
    [ProductId]                           INT              NOT NULL,
    [DeclarationYear]                     INT              NOT NULL,
    [PenaltyPercentage]                   DECIMAL (38, 10) NULL,
    [TotalPremium]                        DECIMAL (38, 10) NULL,
    [IsDeleted]                           BIT              NOT NULL,
    [CreatedBy]                           VARCHAR (50)     NOT NULL,
    [CreatedDate]                         DATETIME         NOT NULL,
    [ModifiedBy]                          VARCHAR (50)     NOT NULL,
    [ModifiedDate]                        DATETIME         NOT NULL,
    [VariancePercentage]                  DECIMAL (38, 10) NULL,
    [VarianceReason]                      VARCHAR (500)    NULL,
    CONSTRAINT [PK_RolePlayerPolicyDeclaration] PRIMARY KEY CLUSTERED ([RolePlayerPolicyDeclarationId] ASC),
    CONSTRAINT [FK_RolePlayerPolicyDeclaration_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId])
);

