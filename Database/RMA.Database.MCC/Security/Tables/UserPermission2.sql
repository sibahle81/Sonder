CREATE TABLE [security].[UserPermission2] (
    [UserId]       INT          NOT NULL,
    [PermissionId] INT          NOT NULL,
    [IsActive]     BIT          NOT NULL,
    [IsDeleted]    BIT          NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     NOT NULL,
    CONSTRAINT [PK_UserPermission2] PRIMARY KEY CLUSTERED ([UserId] ASC, [PermissionId] ASC),
    CONSTRAINT [FK_UserPermission2_Permission] FOREIGN KEY ([PermissionId]) REFERENCES [security].[Permission] ([Id]),
    CONSTRAINT [FK_UserPermission2_User] FOREIGN KEY ([UserId]) REFERENCES [security].[User] ([Id])
);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'UserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'PermissionId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'security', @level1type = N'TABLE', @level1name = N'UserPermission2', @level2type = N'COLUMN', @level2name = N'IsActive';

