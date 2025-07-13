CREATE TABLE [common].[UnderAssessReason] (
    [UnderAssessReasonId]       INT            IDENTITY (1000, 1) NOT NULL,
    [Code]                      VARCHAR (12)   NOT NULL,
    [Description]               VARCHAR (2048) NULL,
    [InvoiceTypeId]             INT            NOT NULL,
    [InvoiceStatusId]           INT            NOT NULL,
    [OverrideAuditObjectTypeId] INT            NULL,
    [ConfirmAuditObjectTypeId]  INT            NULL,
    [CanReinstate]              BIT            CONSTRAINT [DF_UnderAssessReason_CanReinstate] DEFAULT ((0)) NULL,
    [Action]                    VARCHAR (10)   NULL,
    [FirstNotification]         VARCHAR (50)   NULL,
    [SecondNotification]        VARCHAR (50)   NULL,
    [ThirdNotification]         VARCHAR (50)   NULL,
    [IsLineItemReason]          BIT            DEFAULT ((0)) NOT NULL,
    [IsActive]                  BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]                 BIT            DEFAULT ((0)) NOT NULL,
    [CreatedBy]                 VARCHAR (50)   NOT NULL,
    [CreatedDate]               DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                VARCHAR (50)   NOT NULL,
    [ModifiedDate]              DATETIME       NOT NULL,
    CONSTRAINT [PK_common_UnderAssessReason_UnderAssessReasonId] PRIMARY KEY CLUSTERED ([UnderAssessReasonId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'UnderAssessReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'UnderAssessReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'UnderAssessReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'UnderAssessReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'UnderAssessReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'UnderAssessReasonId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ThirdNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ThirdNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ThirdNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ThirdNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ThirdNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ThirdNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'SecondNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'SecondNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'SecondNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'SecondNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'SecondNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'SecondNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'OverrideAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'OverrideAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'OverrideAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'OverrideAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'OverrideAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'OverrideAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsLineItemReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsLineItemReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsLineItemReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsLineItemReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsLineItemReason';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsLineItemReason';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'InvoiceStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'FirstNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'FirstNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'FirstNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'FirstNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'FirstNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'FirstNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ConfirmAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ConfirmAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ConfirmAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ConfirmAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ConfirmAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'ConfirmAuditObjectTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Code';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CanReinstate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CanReinstate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CanReinstate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CanReinstate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CanReinstate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'CanReinstate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Action';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'UnderAssessReason', @level2type = N'COLUMN', @level2name = N'Action';

