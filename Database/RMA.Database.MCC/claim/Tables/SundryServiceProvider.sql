CREATE TABLE [claim].[SundryServiceProvider] (
    [RolePlayerId]                INT          NOT NULL,
    [Name]                        VARCHAR (80)  NOT NULL,
    [Description]                 VARCHAR (MAX) NULL,
    [CompanyNumber]               VARCHAR (10)  NULL,
    [DateStarted]                 DATETIME      NULL,
    [DateClosed]                  DATETIME      NULL,
    [SundryServiceProviderTypeId] INT           NOT NULL,
    [IsVat]                       BIT           NOT NULL,
    [VATRegNumber]                VARCHAR (50)  NULL,
    [IsAuthorised]                BIT           NULL,
    [CreatedDate]                 DATETIME      NOT NULL,
    [CreatedBy]                   VARCHAR (50)  NOT NULL,
    [ModifiedDate]                DATETIME      NOT NULL,
    [ModifiedBy]                  VARCHAR (50)  NOT NULL,
    CONSTRAINT PK_SundryServiceProvider_RolePlayer PRIMARY KEY (RolePlayerId),
    CONSTRAINT [FK_SundryServiceProvider_SundryServiceProviderType] FOREIGN KEY ([SundryServiceProviderTypeId]) REFERENCES [common].[SundryServiceProviderType] ([Id])
);

