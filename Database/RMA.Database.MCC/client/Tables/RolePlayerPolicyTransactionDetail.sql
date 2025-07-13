CREATE TABLE [client].[RolePlayerPolicyTransactionDetail] (
    [RolePlayerPolicyTransactionDetailId] INT              IDENTITY (1, 1) NOT NULL,
    [RolePlayerPolicyTransactionId]       INT              NOT NULL,
    [ProductOptionId]                     INT              NOT NULL,
    [CategoryInsuredId]                   INT              NOT NULL,
    [Rate]                                DECIMAL (38, 10) NOT NULL,
    [NumberOfEmployees]                   INT              NOT NULL,
    [TotalEarnings]                       DECIMAL (38, 10) NOT NULL,
    [Premium]                             DECIMAL (38, 10) NOT NULL,
    [LiveInAllowance]                     INT              NOT NULL,
    [EffectiveFrom]                       DATE             NOT NULL,
    [EffectiveTo]                         DATE             NOT NULL,
    [IsDeleted]                           BIT              NOT NULL,
    [ModifiedBy]                          VARCHAR (50)     NOT NULL,
    [ModifiedDate]                        DATETIME         NOT NULL,
    [CreatedBy]                           VARCHAR (50)     NOT NULL,
    [CreatedDate]                         DATETIME         NOT NULL,
    CONSTRAINT [PK_RolePlayerPolicyTransactionDetail] PRIMARY KEY CLUSTERED ([RolePlayerPolicyTransactionDetailId] ASC),
    CONSTRAINT [FK_RolePlayerPolicyTransactionDetail_RolePlayerPolicyTransaction] FOREIGN KEY ([RolePlayerPolicyTransactionId]) REFERENCES [client].[RolePlayerPolicyTransaction] ([RolePlayerPolicyTransactionId])
);

