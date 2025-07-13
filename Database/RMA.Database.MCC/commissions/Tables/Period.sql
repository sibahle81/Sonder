CREATE TABLE [commission].[Period] (
    [PeriodId]             INT          IDENTITY (1, 1) NOT NULL,
    [YYYY]                 INT          NOT NULL,
    [MM]                   INT          NOT NULL,
    [StartDate]            DATETIME     NOT NULL,
    [EndDate]              DATETIME     NOT NULL,
    [IsDeleted]            BIT          DEFAULT ((0)) NOT NULL,
    [CreatedBy]            VARCHAR (50) NOT NULL,
    [CreatedDate]          DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]           VARCHAR (50) NOT NULL,
    [ModifiedDate]         DATETIME     DEFAULT (getdate()) NOT NULL,
    [PeriodChangeReasonId] INT          NULL,
    CONSTRAINT [PK_Period] PRIMARY KEY CLUSTERED ([PeriodId] ASC)
);




GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'YYYY';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'YYYY';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'YYYY';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'YYYY';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'YYYY';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'YYYY';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'PeriodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'PeriodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'PeriodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'PeriodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'PeriodId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'PeriodId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'MM';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'MM';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'MM';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'MM';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'MM';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'MM';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'commission', @level1type = N'TABLE', @level1name = N'Period', @level2type = N'COLUMN', @level2name = N'CreatedBy';

