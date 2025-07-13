CREATE TABLE [bpm].[WizardConfiguration] (
    [Id]                  INT           NOT NULL,
    [Name]                VARCHAR (50)  NOT NULL,
    [DisplayName]         VARCHAR (50)  NOT NULL,
    [Description]         VARCHAR (100) NOT NULL,
    [SLAWarning]          INT           NULL,
    [SLAEscalation]       INT           NULL,
    [UserSLAWarning]      INT           NULL,
    [UserSLAEscalation]   INT           NULL,
    [AllowEditOnApproval] BIT           DEFAULT ((0)) NOT NULL,
    [IsOverridable]       BIT           DEFAULT ((0)) NOT NULL,
    [IsNotification]      BIT           DEFAULT ((0)) NOT NULL,
    [CanReAssign]         BIT           DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_WizardConfiguration] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UK_Name] UNIQUE NONCLUSTERED ([Name] ASC)
);




GO

GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'UserSLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAWarning';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'SLAEscalation';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsOverridable';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsOverridable';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsOverridable';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsOverridable';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsOverridable';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsOverridable';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsNotification';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'IsNotification';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'DisplayName';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'CanReAssign';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'CanReAssign';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'CanReAssign';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'CanReAssign';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'CanReAssign';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'CanReAssign';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'AllowEditOnApproval';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'AllowEditOnApproval';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'AllowEditOnApproval';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'AllowEditOnApproval';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'AllowEditOnApproval';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfiguration', @level2type = N'COLUMN', @level2name = N'AllowEditOnApproval';

