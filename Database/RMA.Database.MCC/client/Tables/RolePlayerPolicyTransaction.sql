CREATE TABLE [client].[RolePlayerPolicyTransaction] (
    [RolePlayerPolicyTransactionId]       INT              IDENTITY (1, 1) NOT NULL,
    [TenantId]                            INT              NOT NULL,
    [RolePlayerId]                        INT              NOT NULL,
    [PolicyId]                            INT              NOT NULL,
    [CoverPeriod]                         INT              NOT NULL,
    [TransactionTypeId]                   INT              NOT NULL,
    [DocumentNumber]                      VARCHAR (50)     NOT NULL,
    [TotalAmount]                         DECIMAL (38, 10) NULL,
    [EffectiveDate]                       DATE             NOT NULL,
    [SentDate]                            DATETIME         NULL,
    [RolePlayerPolicyTransactionStatusId] INT              NOT NULL,
    [isDeleted]                           BIT              NOT NULL,
    [CreatedBy]                           VARCHAR (50)     NOT NULL,
    [CreatedDate]                         DATETIME         NOT NULL,
    [ModifiedBy]                          VARCHAR (50)     NOT NULL,
    [ModifiedDate]                        DATETIME         NOT NULL,
    [DocumentDate]                        DATE             NULL,
    CONSTRAINT [PK_RolePlayerPolicyTransaction] PRIMARY KEY CLUSTERED ([RolePlayerPolicyTransactionId] ASC)
);



