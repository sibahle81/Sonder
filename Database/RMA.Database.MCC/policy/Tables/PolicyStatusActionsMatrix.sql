CREATE TABLE [policy].[PolicyStatusActionsMatrix] (
    [Id]                          INT IDENTITY (1, 1) NOT NULL,
    [PolicyStatus]                INT NOT NULL,
    [DoRaiseInstallementPremiums] BIT NOT NULL,
    [SubmitDebitOrder]            BIT NOT NULL,
    CONSTRAINT [PK_PolicyStatusActionsMatrix] PRIMARY KEY CLUSTERED ([Id] ASC)
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'SubmitDebitOrder';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'SubmitDebitOrder';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'SubmitDebitOrder';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'SubmitDebitOrder';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'SubmitDebitOrder';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'SubmitDebitOrder';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'PolicyStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'PolicyStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'PolicyStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'PolicyStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'PolicyStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'PolicyStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'DoRaiseInstallementPremiums';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'DoRaiseInstallementPremiums';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'DoRaiseInstallementPremiums';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'DoRaiseInstallementPremiums';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'DoRaiseInstallementPremiums';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'policy', @level1type = N'TABLE', @level1name = N'PolicyStatusActionsMatrix', @level2type = N'COLUMN', @level2name = N'DoRaiseInstallementPremiums';

