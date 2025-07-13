CREATE TABLE [medical].[MISwitchBatchDeleteReason] (
    [Id]             INT           IDENTITY (1, 1) NOT NULL,
    [Description]    VARCHAR (255) NULL,
    [IsActive]       BIT           NOT NULL,
    [SendRemittance] BIT           NULL,
    [IsDeleted]      BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]      VARCHAR (50)  DEFAULT ('System') NOT NULL,
    [CreatedDate]    DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]     VARCHAR (50)  DEFAULT ('System') NOT NULL,
    [ModifiedDate]   DATETIME      DEFAULT (getdate()) NOT NULL
);






GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'SendRemittance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'SendRemittance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'SendRemittance';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'SendRemittance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'SendRemittance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'SendRemittance';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'MISwitchBatchDeleteReason', @level2type = N'COLUMN', @level2name = N'CreatedBy';

