CREATE TABLE [security].[RolePermission] (
    [RoleId]       INT NOT NULL,
    [PermissionId] INT NOT NULL,
    CONSTRAINT [PK_RolePermission] PRIMARY KEY CLUSTERED ([RoleId] ASC, [PermissionId] ASC),
    CONSTRAINT [FK_RolePermission_Permission] FOREIGN KEY ([PermissionId]) REFERENCES [security].[Permission] ([Id]),
    CONSTRAINT [FK_RolePermission_Role] FOREIGN KEY ([RoleId]) REFERENCES [security].[Role] ([Id])
);


GO

CREATE TRIGGER [security].[tr_temp_Security_RolePermissionFFL_Sync_Delete] ON [security].[RolePermission]
    FOR DELETE
    AS
    BEGIN--This trigger is a temporary trigger to keep the data in sync for FFL switching
		IF (EXISTS (SELECT 1 
                 FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_SCHEMA = 'security' 
                 AND  TABLE_NAME = 'RolePermissionFFL'))
		BEGIN
			DELETE RolePermissionFFL FROM [security].[RolePermissionFFL] RolePermissionFFL INNER JOIN deleted ON RolePermissionFFL.RoleId  = deleted.RoleId and RolePermissionFFL.PermissionId = deleted.PermissionId
		END
      
    END
GO

CREATE TRIGGER [security].[tr_temp_Security_RolePermissionFFL_Sync_Insert] ON [security].[RolePermission]
    AFTER INSERT
    AS
    BEGIN--This trigger is a temporary trigger to keep the data in sync for FFL switching
		IF (EXISTS (SELECT 1 
                 FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_SCHEMA = 'security' 
                 AND  TABLE_NAME = 'RolePermissionFFL'))
		BEGIN
			INSERT INTO [security].[RolePermissionFFL]
			SELECT inserted.RoleId, inserted.PermissionId FROM inserted
		END
      
    END
GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'RoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'RolePermission', @level2type = N'COLUMN', @level2name = N'PermissionId';

