CREATE TABLE [common].[CoverType] (
    [Id]   INT          NOT NULL,
    [Name] VARCHAR (50) NOT NULL,
    [Description] VARCHAR (50) NOT NULL,
    CONSTRAINT [PK_common.CoverType] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [AK_common.CoverType_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'CoverType', @level2type = N'COLUMN', @level2name = N'Id';

