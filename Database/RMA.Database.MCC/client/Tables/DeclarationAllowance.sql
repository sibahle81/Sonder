CREATE TABLE [client].[DeclarationAllowance] (
    [DeclarationAllowanceId] INT             IDENTITY (1, 1) NOT NULL,
    [DeclarationId]          INT             NOT NULL,
    [AllowanceTypeId]        INT             NOT NULL,
    [Allowance]              DECIMAL (18, 2) NULL,
    CONSTRAINT [PK_DeclarationAllowance] PRIMARY KEY CLUSTERED ([DeclarationAllowanceId] ASC),
    CONSTRAINT [FK_AllowanceType_DeclarationAllowance] FOREIGN KEY ([AllowanceTypeId]) REFERENCES [common].[AllowanceType] ([Id]),
    CONSTRAINT [FK_Declaration_DeclarationAllowance] FOREIGN KEY ([DeclarationId]) REFERENCES [client].[Declaration] ([DeclarationId])
);

