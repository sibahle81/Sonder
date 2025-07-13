CREATE TABLE [pension].[RolePlayerPensionTransaction] (
    [RolePlayerPensionTransactionId]       INT              IDENTITY (1, 1) NOT NULL,
    [TenantId]                             INT              NOT NULL,
    [RolePlayerId]                         INT              NOT NULL,
    [PolicyId]                             INT              NOT NULL,
    [CoverPeriod]                          INT              NULL,
    [TransactionTypeId]                    INT              NOT NULL,
    [DocumentNumber]                       VARCHAR (50)     NOT NULL,
    [TotalAmount]                          DECIMAL (38, 10) NULL,
    [EffectiveDate]                        DATE             NOT NULL,
    [SentDate]                             DATETIME         NULL,
    [RolePlayerPensionTransactionStatusId] INT              NOT NULL,
    [IsActive]                             BIT              NOT NULL,
    [IsDeleted]                            BIT              NOT NULL,
    [CreatedBy]                            VARCHAR (50)     NOT NULL,
    [CreatedDate]                          DATETIME         NOT NULL,
    [ModifiedBy]                           VARCHAR (50)     NOT NULL,
    [ModifiedDate]                         DATETIME         NOT NULL,
    CONSTRAINT [PK_RolePlayerPensionTransaction] PRIMARY KEY CLUSTERED ([RolePlayerPensionTransactionId] ASC)
);

