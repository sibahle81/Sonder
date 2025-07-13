CREATE TABLE [client].[RolePlayerPolicyDeclarationDetail] (
    [RolePlayerPolicyDeclarationDetailId] INT              IDENTITY (1, 1) NOT NULL,
    [RolePlayerPolicyDeclarationId]       INT              NOT NULL,
    [ProductOptionId]                     INT              NOT NULL,
    [CategoryInsuredId]                   INT              NOT NULL,
    [Rate]                                DECIMAL (38, 10) NULL,
    [AverageNumberOfEmployees]            INT              NOT NULL,
    [AverageEmployeeEarnings]             DECIMAL (38, 10) NULL,
    [Premium]                             DECIMAL (38, 10) NULL,
    [LiveInAllowance]                     DECIMAL (38, 10) NULL,
    [IsDeleted]                           BIT              NOT NULL,
    [CreatedBy]                           VARCHAR (50)     NOT NULL,
    [CreatedDate]                         DATETIME         NOT NULL,
    [ModifiedBy]                          VARCHAR (50)     NOT NULL,
    [ModifiedDate]                        DATETIME         NOT NULL,
    [EffectiveFrom]                       DATE             NULL,
    [EffectiveTo]                         DATE             NULL,
    CONSTRAINT [PK_RolePlayerPolicyDeclarationDetail] PRIMARY KEY CLUSTERED ([RolePlayerPolicyDeclarationDetailId] ASC),
    CONSTRAINT [FK_RolePlayerPolicyDeclarationDetail_RolePlayerPolicyDeclaration] FOREIGN KEY ([RolePlayerPolicyDeclarationId]) REFERENCES [client].[RolePlayerPolicyDeclaration] ([RolePlayerPolicyDeclarationId])
);

