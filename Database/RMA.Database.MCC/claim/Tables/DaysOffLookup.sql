CREATE TABLE [claim].[DaysOffLookup] (
    [DaysOffLookupId] INT          NOT NULL,
    [Minimum]         MONEY        NOT NULL,
    [Average]         MONEY        NOT NULL,
    [Maximum]         MONEY        NOT NULL,
    [StartDate]       DATETIME     NOT NULL,
    [EndDate]         DATETIME     NOT NULL,
    [IsActive]        BIT          CONSTRAINT [DF_DaysOffLookup_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]       BIT          CONSTRAINT [DF_DaysOffLookup_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]       VARCHAR (50) NOT NULL,
    [CreatedDate]     DATETIME     CONSTRAINT [DF_DaysOffLookup_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]      VARCHAR (50) NOT NULL,
    [ModifiedDate]    DATETIME     CONSTRAINT [DF_DaysOffLookup_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_DaysOffLookup] PRIMARY KEY CLUSTERED ([DaysOffLookupId] ASC)
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'StartDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Minimum';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Minimum';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Minimum';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Minimum';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Minimum';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Minimum';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Maximum';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Maximum';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Maximum';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Maximum';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Maximum';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Maximum';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'EndDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'DaysOffLookupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'DaysOffLookupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'DaysOffLookupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'DaysOffLookupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'DaysOffLookupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'DaysOffLookupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Average';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Average';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Average';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Average';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Average';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'claim', @level1type = N'TABLE', @level1name = N'DaysOffLookup', @level2type = N'COLUMN', @level2name = N'Average';

