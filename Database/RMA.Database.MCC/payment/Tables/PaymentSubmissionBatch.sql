CREATE TABLE [payment].[PaymentSubmissionBatch] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [CreatedDate] DATETIME      NOT NULL,
    [Reference]   VARCHAR (250) NULL,
    CONSTRAINT [PK_payment.PaymentSubmissionBatch] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Reference';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'payment', @level1type = N'TABLE', @level1name = N'PaymentSubmissionBatch', @level2type = N'COLUMN', @level2name = N'CreatedDate';

