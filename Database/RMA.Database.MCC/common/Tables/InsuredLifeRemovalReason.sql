CREATE TABLE [common].[InsuredLifeRemovalReason] (
    [Id]   INT           NOT NULL,
    [Name] VARCHAR (100) NOT NULL,
    CONSTRAINT [PK_common.InsuredLifeRemovalReason] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'common', @level1type = N'TABLE', @level1name = N'InsuredLifeRemovalReason', @level2type = N'COLUMN', @level2name = N'Id';

