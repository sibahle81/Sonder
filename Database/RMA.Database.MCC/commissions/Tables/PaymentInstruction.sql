CREATE TABLE [commission].[PaymentInstruction] (
    [PaymentInstructionId]    INT                                                  IDENTITY (1, 1) NOT NULL,
    [HeaderId]                INT                                                  NOT NULL,
    [CommissionPaymentTypeId] INT                                                  NOT NULL,
    [Amount]                  DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [StatusId]                INT                                                  DEFAULT ((1)) NOT NULL,
    [Results]                 VARCHAR (2000)                                       NULL,
    [IsDeleted]               BIT                                                  DEFAULT ((0)) NOT NULL,
    [CreatedBy]               VARCHAR (50)                                         NOT NULL,
    [CreatedDate]             DATETIME                                             DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]              VARCHAR (50)                                         NOT NULL,
    [ModifiedDate]            DATETIME                                             DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_PaymentInstruction] PRIMARY KEY CLUSTERED ([PaymentInstructionId] ASC),
    CONSTRAINT [FK_PaymentInstruction_CommissionStatusLink] FOREIGN KEY ([StatusId]) REFERENCES [common].[CommissionStatus] ([Id]),
    CONSTRAINT [FK_PaymentInstruction_Header] FOREIGN KEY ([HeaderId]) REFERENCES [commission].[Header] ([HeaderId]),
    CONSTRAINT [FK_PaymentInstruction_PaymentTypeLink] FOREIGN KEY ([CommissionPaymentTypeId]) REFERENCES [common].[CommissionPaymentType] ([Id])
);


GO

GO

GO

GO

GO

GO

GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'StatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Results';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Results';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Results';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Results';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Results';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Results';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'PaymentInstructionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'HeaderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CommissionPaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CommissionPaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CommissionPaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CommissionPaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CommissionPaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'CommissionPaymentTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'PaymentInstruction', @level2type = N'COLUMN', @level2name = N'Amount';

