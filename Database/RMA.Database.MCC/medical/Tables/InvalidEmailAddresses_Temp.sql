CREATE TABLE [medical].[InvalidEmailAddresses_Temp] (
    [InvalidEmailAddrId] BIGINT         IDENTITY (1, 1) NOT NULL,
    [MspId]              INT            NOT NULL,
    [EmailAddress]       VARCHAR (1024) NULL,
    [EmailSubject]       VARCHAR (2048) NULL,
    [LastChangedDate]    DATETIME       NOT NULL,
    [IsActive]           BIT            NOT NULL,
    [IsDeleted]          BIT            NOT NULL,
    [CreatedBy]          VARCHAR (50)   NOT NULL,
    [CreatedDate]        DATETIME       NOT NULL,
    [ModifiedBy]         VARCHAR (50)   NOT NULL,
    [ModifiedDate]       DATETIME       NOT NULL,
    CONSTRAINT [PK_Medical_InvalidEmailAddresses_InvalidEmailAddrId] PRIMARY KEY CLUSTERED ([InvalidEmailAddrId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_Medical_InvalidEmailAddresses_MspId] FOREIGN KEY ([MspId]) REFERENCES [medical].[HealthCareProvider] ([RolePlayerId])
);

