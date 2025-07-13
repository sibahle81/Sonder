CREATE TABLE [client].[RolePlayerRelation] (
    [Id]                   INT IDENTITY (1, 1) NOT NULL,
    [FromRolePlayerId]     INT NOT NULL,
    [ToRolePlayerId]       INT NOT NULL,
    [RolePlayerTypeId]     INT NOT NULL,
    [PolicyId]             INT NULL,
    [AllocationPercentage] INT NULL,
    CONSTRAINT [PK_RolePlayerRelation] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK__RolePlaye__Polic__32C3C32A] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK_RolePlayerRelation_RolePlayer] FOREIGN KEY ([FromRolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId]),
    CONSTRAINT [FK_RolePlayerRelation_RolePlayer1] FOREIGN KEY ([ToRolePlayerId]) REFERENCES [client].[RolePlayer] ([RolePlayerId]),
    CONSTRAINT [FK_RolePlayerRelation_RolePlayerType] FOREIGN KEY ([RolePlayerTypeId]) REFERENCES [client].[RolePlayerType] ([RolePlayerTypeId])
);










GO

GO

GO

GO

GO

GO

GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_RolePlayerRelation]
    ON [client].[RolePlayerRelation]([FromRolePlayerId] ASC, [ToRolePlayerId] ASC, [RolePlayerTypeId] ASC, [PolicyId] ASC);


GO
CREATE NONCLUSTERED INDEX [RolePlayerRelation_RolePlayerTypeId_PolicyId]
    ON [client].[RolePlayerRelation]([RolePlayerTypeId] ASC, [PolicyId] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'ToRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'ToRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'ToRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'ToRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'ToRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'ToRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'RolePlayerTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'PolicyId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'FromRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'FromRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'FromRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'FromRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'FromRolePlayerId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'client', @level1type = N'TABLE', @level1name = N'RolePlayerRelation', @level2type = N'COLUMN', @level2name = N'FromRolePlayerId';


GO
CREATE NONCLUSTERED INDEX [IX_RolePlayerRelation_ToRolePlayerId_B6735]
    ON [client].[RolePlayerRelation]([ToRolePlayerId] ASC);

