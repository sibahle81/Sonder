CREATE TABLE [commission].[ClawBackAccount] (
    [ClawBackAccountId] INT                                                  IDENTITY (1, 1) NOT NULL,
    [RecepientTypeId]   INT                                                  NOT NULL,
    [RecepientId]       INT                                                  NOT NULL,
    [RecepientCode]     VARCHAR (20)                                         NOT NULL,
    [RecepientName]     VARCHAR (250)                                        NOT NULL,
    [AccountBalance]    DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [IsDeleted]         BIT                                                  CONSTRAINT [DF__ClawBackAccount__IsDelete__7485CE38] DEFAULT ((0)) NOT NULL,
    [CreatedBy]         VARCHAR (50)                                         NOT NULL,
    [CreatedDate]       DATETIME                                             CONSTRAINT [DF__ClawBackAccount__CreatedD__7579F271] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]        VARCHAR (50)                                         NOT NULL,
    [ModifiedDate]      DATETIME                                             CONSTRAINT [DF__ClawBackAccount__Modified__766E16AA] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_ClawBackAccountAccount] PRIMARY KEY CLUSTERED ([ClawBackAccountId] ASC),
    CONSTRAINT [UNIQUE_ClawBackAccount_RecepientTypeId_RecepientId] UNIQUE NONCLUSTERED ([RecepientTypeId] ASC, [RecepientId] ASC)
);


GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientCode';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'RecepientCode';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ClawBackAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ClawBackAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ClawBackAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ClawBackAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ClawBackAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'ClawBackAccountId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'AccountBalance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'AccountBalance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'AccountBalance';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'AccountBalance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'AccountBalance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'ClawBackAccount', @level2type = N'COLUMN', @level2name = N'AccountBalance';

