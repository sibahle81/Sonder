CREATE TABLE [client].[DeclarationBillingIntegration] (
    [DeclarationBillingIntegrationId]       INT             IDENTITY (1, 1) NOT NULL,
    [DeclarationId]                         INT             NOT NULL,
    [Amount]                                DECIMAL (18, 2) NOT NULL,
    [DeclarationBillingIntegrationStatusId] INT             NOT NULL,
    [DeclarationBillingIntegrationTypeId]   INT             NOT NULL,
    [BillingProcessedDate]                  DATETIME        NULL,
    CONSTRAINT [PK_DeclarationBillingIntegration] PRIMARY KEY CLUSTERED ([DeclarationBillingIntegrationId] ASC),
    CONSTRAINT [FK_Declaration_DeclarationBillingIntegration] FOREIGN KEY ([DeclarationId]) REFERENCES [client].[Declaration] ([DeclarationId]),
    CONSTRAINT [FK_DeclarationBillingIntegrationStatus_DeclarationBillingIntegration] FOREIGN KEY ([DeclarationBillingIntegrationStatusId]) REFERENCES [common].[DeclarationBillingIntegrationStatus] ([Id]),
    CONSTRAINT [FK_DeclarationBillingIntegrationType_DeclarationBillingIntegration] FOREIGN KEY ([DeclarationBillingIntegrationTypeId]) REFERENCES [common].[DeclarationBillingIntegrationType] ([Id])
);

