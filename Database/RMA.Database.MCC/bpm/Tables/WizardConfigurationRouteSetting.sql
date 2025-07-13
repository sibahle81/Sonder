CREATE TABLE [bpm].[WizardConfigurationRouteSetting] (
    [Id]                      INT            IDENTITY (1, 1) NOT NULL,
    [WizardConfigurationId]   INT            NOT NULL,
    [Name]                    VARCHAR (100)  NOT NULL,
    [Description]             VARCHAR (1000) NOT NULL,
    [RoutingUserId]           INT            NULL,
    [RoutingRoleId]           INT            NULL,
    [SendForReviewUserId]     INT            NULL,
    [SendForReviewRoleId]     INT            NULL,
    [MessageTemplate]         VARCHAR (1000) NOT NULL,
    [IsDeleted]               BIT            NOT NULL,
    [CreatedBy]               VARCHAR (50)   NOT NULL,
    [CreatedDate]             DATETIME       NOT NULL,
    [ModifiedBy]              VARCHAR (50)   NOT NULL,
    [ModifiedDate]            DATETIME       NOT NULL,
    [WorkflowType]            VARCHAR (50)   NULL,
    [WorkflowTypeDescription] VARCHAR (100)  NULL,
    [ActionLink]              VARCHAR (255)  NULL,
    [NotificationTitle]       VARCHAR (50)   NULL,
    CONSTRAINT [PK_WizardConfigurationRouteSetting] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_WizardConfigurationRouteSetting_WizardConfiguration] FOREIGN KEY ([WizardConfigurationId]) REFERENCES [bpm].[WizardConfiguration] ([Id])
);






GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'SendForReviewRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingUserId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingUserId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'RoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'MessageTemplate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'MessageTemplate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'MessageTemplate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'MessageTemplate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'MessageTemplate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'MessageTemplate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'WizardConfigurationRouteSetting', @level2type = N'COLUMN', @level2name = N'CreatedBy';

