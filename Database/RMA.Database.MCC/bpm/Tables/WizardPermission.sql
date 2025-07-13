CREATE TABLE [bpm].[WizardPermission] (
    [Id]                     INT          IDENTITY (1, 1) NOT NULL,
    [WizardConfigurationId]  INT          NOT NULL,
    [WizardPermissionTypeId] INT          NOT NULL,
    [PermissionName]         VARCHAR (50) NULL,
    CONSTRAINT [PK_WizardPermission] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_WizardPermission_WizardConfiguration] FOREIGN KEY ([WizardConfigurationId]) REFERENCES [bpm].[WizardConfiguration] ([Id]),
    CONSTRAINT [FK_WizardPermission_WizardPermissionType] FOREIGN KEY ([WizardPermissionTypeId]) REFERENCES [common].[WizardPermissionType] ([Id])
);


GO

GO

GO

GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardPermissionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardPermissionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardPermissionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardPermissionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardPermissionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardPermissionTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'PermissionName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'PermissionName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'PermissionName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'PermissionName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'PermissionName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'PermissionName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardPermission', @level2type = N'COLUMN', @level2name = N'Id';

