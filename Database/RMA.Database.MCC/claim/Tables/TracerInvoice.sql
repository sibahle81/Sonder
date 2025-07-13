CREATE TABLE [claim].[TracerInvoice] (
    [TracerInvoiceId] INT             IDENTITY (1, 1) NOT NULL,
    [ClaimId]         INT             NOT NULL,
    [RolePlayerId]    INT             NOT NULL,
    [TracingFee]      DECIMAL (18, 2) NULL,
    [PaymentStatus]   INT             NOT NULL,
    [Reason]          VARCHAR (100)   NULL,
    [PayDate]         DATETIME        NULL,
    [PaymentId]       INT             NULL,
    [IsDeleted]       BIT             NOT NULL,
    [CreatedBy]       VARCHAR (50)    NOT NULL,
    [CreatedDate]     DATETIME        NOT NULL,
    [ModifiedBy]      VARCHAR (50)    NOT NULL,
    [ModifiedDate]    DATETIME        NOT NULL,
    CONSTRAINT [PK_TracerInvoice] PRIMARY KEY CLUSTERED ([TracerInvoiceId] ASC),
    CONSTRAINT [FK_TracerInvoice_Claim] FOREIGN KEY ([ClaimId]) REFERENCES [claim].[Claim] ([ClaimId]),
    CONSTRAINT [FK_TracerInvoice_RolePlayer] FOREIGN KEY ([RolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId])
);


GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracingFee';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracingFee';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracingFee';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracingFee';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracingFee';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracingFee';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracerInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracerInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracerInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracerInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracerInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'TracerInvoiceId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'RolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'Reason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PaymentId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PayDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PayDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PayDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PayDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PayDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'PayDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ClaimId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'TracerInvoice', @level2type = N'COLUMN', @level2name = N'ClaimId';

