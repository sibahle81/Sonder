CREATE TABLE [policy].[InsurerGroupSchemeAccess] (
    [InsurerGroupSchemeAccessId] INT            IDENTITY (1, 1) NOT NULL,
    [ApplicationId]              NVARCHAR (128) NOT NULL,
    [InsurerId]                  INT            NOT NULL,
    [ParentPolicyId]             INT            NOT NULL,
    [IsActive]                   BIT            DEFAULT ((1)) NOT NULL,
    [DeactivationReason]         VARCHAR (120)  NULL,
    [IsDeleted]                  BIT            DEFAULT ((0)) NOT NULL,
    [CreatedDate]                DATETIME       DEFAULT (getdate()) NOT NULL,
    [CreatedBy]                  VARCHAR (50)   NULL,
    [ModifiedDate]               DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                 VARCHAR (50)   NOT NULL,
    PRIMARY KEY CLUSTERED ([InsurerGroupSchemeAccessId] ASC),
    FOREIGN KEY ([ApplicationId]) REFERENCES [security].[Application] ([ApplicationID]),
    FOREIGN KEY ([InsurerId]) REFERENCES [policy].[Insurer] ([Id]),
    FOREIGN KEY ([ParentPolicyId]) REFERENCES [policy].[Policy] ([PolicyId])
);

