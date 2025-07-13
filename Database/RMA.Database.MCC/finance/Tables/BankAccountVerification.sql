CREATE TABLE [finance].[BankAccountVerification] (
    [BankAccountVerificationId]            INT                                               IDENTITY (1, 1) NOT NULL,
    [IsValid]                              BIT                                               NULL,
    [BankAccountVerificationPurposeTypeId] INT                                               NOT NULL,
    [AccountNumber]                        VARCHAR (20) MASKED WITH (FUNCTION = 'default()') NULL,
    [CreatedBy]                            VARCHAR (50)                                      NOT NULL,
    [CreatedDate]                          DATETIME                                          NOT NULL,
    [ModifiedBy]                           VARCHAR (50)                                      NOT NULL,
    [ModifiedDate]                         DATETIME                                          NOT NULL,
    CONSTRAINT [PK_BankAccountVerification] PRIMARY KEY CLUSTERED ([BankAccountVerificationId] ASC),
    CONSTRAINT [FK_BankAccountVerification_BankAccountVerificationPurposeType1] FOREIGN KEY ([BankAccountVerificationPurposeTypeId]) REFERENCES [common].[BankAccountVerificationPurposeType] ([Id])
);


GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'IsValid';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'IsValid';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'IsValid';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'IsValid';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'IsValid';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'IsValid';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationPurposeTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationPurposeTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationPurposeTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationPurposeTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationPurposeTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationPurposeTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'BankAccountVerificationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'AccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'AccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'AccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'AccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'AccountNumber';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'finance', @level1type = N'TABLE', @level1name = N'BankAccountVerification', @level2type = N'COLUMN', @level2name = N'AccountNumber';

