CREATE TABLE [payment].[EuropeAssistPayment] (
    [Id]                          INT                                             IDENTITY (1, 1) NOT NULL,
    [PremiumListingTransactionId] INT                                             NOT NULL,
    [RolePlayerId]                INT                                             NOT NULL,
    [PolicyId]                    INT                                             NULL,
    [InvoiceDate]                 DATE                                            NOT NULL,
    [InvoiceAmount]               FLOAT (53) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [PaymentId]                   INT                                             NULL,
    [PaymentAmount]               FLOAT (53) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [PaymentStatusId]             INT                                             NOT NULL,
    [IsDeleted]                   BIT                                             NOT NULL,
    [CreatedBy]                   VARCHAR (50)                                    NOT NULL,
    [CreatedDate]                 DATETIME                                        NOT NULL,
    [ModifiedBy]                  VARCHAR (50)                                    NOT NULL,
    [ModifiedDate]                DATETIME                                        NOT NULL,
    CONSTRAINT [PK__EuropeAs__3214EC07782CD067] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK__EuropeAs__Payme__22CBBBD5] FOREIGN KEY ([PaymentStatusId]) REFERENCES [common].[PaymentStatus] ([Id]),
    CONSTRAINT [FK__EuropeAs__Polic__21D7979C] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK__EuropeAs__RoleP__20E37363] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PremiumListingTransactionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'InvoiceAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'EuropeAssistPayment', @level2type = N'COLUMN', @level2name = N'CreatedBy';

