CREATE TABLE [security].[RolePermissionFFL] (
    [RoleId]       INT NOT NULL,
    [PermissionId] INT NOT NULL,
    CONSTRAINT [PK_RolePermissionC] PRIMARY KEY CLUSTERED ([RoleId] ASC, [PermissionId] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermissionFFL', @level2type = N'COLUMN', @level2name = N'PermissionId';

