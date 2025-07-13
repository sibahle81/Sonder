CREATE TABLE [security].[UserPermission] (
    [UserId]       INT NOT NULL,
    [PermissionId] INT NOT NULL,
    CONSTRAINT [PK_UserPermission] PRIMARY KEY CLUSTERED ([UserId] ASC, [PermissionId] ASC),
    CONSTRAINT [FK_UserPermission_Permission] FOREIGN KEY ([PermissionId]) REFERENCES [security].[Permission] ([Id]),
    CONSTRAINT [FK_UserPermission_User] FOREIGN KEY ([UserId]) REFERENCES [security].[User] ([Id])
);




GO

CREATE TRIGGER [security].tr_temp_Security_UserPermission2_Sync_Delete ON [security].[UserPermission]
    FOR DELETE
    AS
    BEGIN--This trigger is a temporary trigger to keep the data in sync for FFL switching
		IF (EXISTS (SELECT 1 
                 FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_SCHEMA = 'security' 
                 AND  TABLE_NAME = 'UserPermission2'))
		BEGIN
			DELETE UserPermission2 FROM [security].[UserPermission2] UserPermission2 INNER JOIN deleted ON UserPermission2.UserId  = deleted.UserId and UserPermission2.PermissionId = deleted.PermissionId
		END
      
    END
GO
CREATE TRIGGER [security].[tr_temp_Security_UserPermission2_Sync_Insert] ON [security].[UserPermission]
    AFTER INSERT
    AS
    BEGIN--This trigger is a temporary trigger to keep the data in sync for FFL switching
		IF (EXISTS (SELECT 1 
                 FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_SCHEMA = 'security' 
                 AND  TABLE_NAME = 'UserPermission2'))
		BEGIN

			TRUNCATE TABLE [security].[UserPermission]
			TRUNCATE TABLE [security].[UserPermission2]
			--INSERT INTO [security].[UserPermission2]
			--SELECT inserted.UserId, inserted.PermissionId, 1, 0, 'System', GETDATE() FROM inserted
		END
      
    END
GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission', @level2type = N'COLUMN', @level2name = N'PermissionId';

