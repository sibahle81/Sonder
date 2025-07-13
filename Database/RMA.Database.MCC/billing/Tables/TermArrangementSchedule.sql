CREATE TABLE [billing].[TermArrangementSchedule] (
    [TermArrangementScheduleId]       INT                                                  IDENTITY (1, 1) NOT NULL,
    [TermArrangementId]               INT                                                  NOT NULL,
    [Amount]                          DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [TermArrangementScheduleStatusId] INT                                                  NOT NULL,
    [Balance]                         DECIMAL (18, 2) MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [PaymentDate]                     DATE                                                 NOT NULL,
    [IsDeleted]                       BIT                                                  CONSTRAINT [DF_TermArrangementSchedule_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                       VARCHAR (50)                                         NOT NULL,
    [CreatedDate]                     DATETIME                                             NOT NULL,
    [ModifiedBy]                      VARCHAR (50)                                         NOT NULL,
    [ModifiedDate]                    DATETIME                                             NOT NULL,
    [AllocationDate]                  DATETIME                                             NULL,
    [LogProcessed]                    BIT                                                  NULL,
    [InadequatePaymentProcessed]      BIT                                                  NULL,
    [MissedPaymentProcessed]          BIT                                                  NULL,
    CONSTRAINT [PK_TermArrangementSchedule] PRIMARY KEY CLUSTERED ([TermArrangementScheduleId] ASC),
    CONSTRAINT [FK_TermArrangementSchedule_TermArrangement] FOREIGN KEY ([TermArrangementId]) REFERENCES [billing].[TermArrangement] ([TermArrangementId]),
    CONSTRAINT [FK_TermArrangementSchedule_TermArrangementScheduleStatus] FOREIGN KEY ([TermArrangementScheduleStatusId]) REFERENCES [common].[TermArrangementScheduleStatus] ([Id])
);






GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementScheduleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'TermArrangementId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'PaymentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'PaymentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'PaymentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'PaymentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'PaymentDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'PaymentDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Balance';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'Yes', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Personal', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Confidential', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'Group Finance', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Amount';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'CFO', @level0type = N'SCHEMA', @level0name = N'billing', @level1type = N'TABLE', @level1name = N'TermArrangementSchedule', @level2type = N'COLUMN', @level2name = N'Amount';

