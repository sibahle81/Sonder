CREATE TABLE [Load].[BulkPaymentListing] (
    [Id]             INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier] UNIQUEIDENTIFIER NOT NULL,
    [PolicyNumber]   VARCHAR (64)     NOT NULL,
    [CreatedDate]    DATETIME         NOT NULL,
    [PaymentAmount]  MONEY            NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PolicyNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'PaymentAmount';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'FileIdentifier';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'Load', @level1type = N'TABLE', @level1name = N'BulkPaymentListing', @level2type = N'COLUMN', @level2name = N'CreatedDate';

