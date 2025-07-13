CREATE TABLE [bpm].[Wizard] (
    [Id]                    INT           IDENTITY (1, 1) NOT NULL,
    [TenantId]              INT           CONSTRAINT [DF_Wizard_TenantId] DEFAULT ((1)) NOT NULL,
    [WizardConfigurationId] INT           NOT NULL,
    [WizardStatusId]        INT           NOT NULL,
    [LinkedItemId]          INT           NULL,
    [Name]                  VARCHAR (200) NOT NULL,
    [Data]                  VARCHAR (MAX) NOT NULL,
    [CurrentStepIndex]      INT           NOT NULL,
    [LockedToUser]          VARCHAR (50)  NULL,
    [CustomStatus]          VARCHAR (100) NULL,
    [CustomRoutingRoleId]   INT           NULL,
    [IsActive]              BIT           CONSTRAINT [DF__Wizard__IsActive__5812160E] DEFAULT ((1)) NOT NULL,
    [IsDeleted]             BIT           CONSTRAINT [DF__Wizard__IsDelete__59063A47] DEFAULT ((0)) NOT NULL,
    [CreatedBy]             VARCHAR (50)  NOT NULL,
    [CreatedDate]           DATETIME      CONSTRAINT [DF__Wizard__CreatedD__59FA5E80] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]            VARCHAR (50)  NOT NULL,
    [ModifiedDate]          DATETIME      CONSTRAINT [DF__Wizard__Modified__5AEE82B9] DEFAULT (getdate()) NOT NULL,
    [StartDateAndTime]      DATETIME      NULL,
    [EndDateAndTime]        DATETIME      NULL,
    CONSTRAINT [PK_Wizard] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Wizard_Tenant] FOREIGN KEY ([TenantId]) REFERENCES [security].[Tenant] ([Id]),
    CONSTRAINT [FK_Wizard_WizardConfiguration] FOREIGN KEY ([WizardConfigurationId]) REFERENCES [bpm].[WizardConfiguration] ([Id]),
    CONSTRAINT [FK_Wizard_WizardStatus] FOREIGN KEY ([WizardStatusId]) REFERENCES [common].[WizardStatus] ([Id])
);












GO

GO

GO

GO

GO

GO

GO

GO

GO
CREATE NONCLUSTERED INDEX [idx_Wizard_WizardStatusId]
    ON [bpm].[Wizard]([WizardStatusId] ASC);


GO
CREATE NONCLUSTERED INDEX [idx_Wizard_WizardConfigurationId]
    ON [bpm].[Wizard]([WizardConfigurationId] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardStatusId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'WizardConfigurationId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'TenantId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'StartDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'StartDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'StartDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'StartDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'StartDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'StartDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LockedToUser';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LockedToUser';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LockedToUser';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LockedToUser';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LockedToUser';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LockedToUser';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LinkedItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LinkedItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LinkedItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LinkedItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LinkedItemId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'LinkedItemId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Id';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'EndDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'EndDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'EndDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'EndDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'EndDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'EndDateAndTime';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Data';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Data';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Data';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Data';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Data';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'Data';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomStatus';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomStatus';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomRoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomRoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomRoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomRoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomRoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CustomRoutingRoleId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CurrentStepIndex';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CurrentStepIndex';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CurrentStepIndex';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CurrentStepIndex';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CurrentStepIndex';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CurrentStepIndex';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'bpm', @level1type = N'TABLE', @level1name = N'Wizard', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_TenantId_WizardStatusId_IsActive_IsDeleted_CreatedBy_E89AA]
    ON [bpm].[Wizard]([TenantId] ASC, [WizardStatusId] ASC, [IsActive] ASC, [IsDeleted] ASC, [CreatedBy] ASC)
    INCLUDE([Name]);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_TenantId_WizardStatusId_IsActive_IsDeleted_CreatedBy_7E96A]
    ON [bpm].[Wizard]([TenantId] ASC, [WizardStatusId] ASC, [IsActive] ASC, [IsDeleted] ASC, [CreatedBy] ASC)
    INCLUDE([WizardConfigurationId], [LinkedItemId], [Name], [Data], [CurrentStepIndex], [LockedToUser], [CustomStatus], [CustomRoutingRoleId], [CreatedDate], [ModifiedBy], [ModifiedDate], [StartDateAndTime], [EndDateAndTime]);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_IsDeleted_WizardStatusId_LockedToUser_D0C96]
    ON [bpm].[Wizard]([IsDeleted] ASC, [WizardStatusId] ASC, [LockedToUser] ASC)
    INCLUDE([WizardConfigurationId], [Name], [CreatedBy]);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_IsDeleted_WizardStatusId_LockedToUser_BE4F1]
    ON [bpm].[Wizard]([IsDeleted] ASC, [WizardStatusId] ASC, [LockedToUser] ASC)
    INCLUDE([WizardConfigurationId]);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_IsDeleted_WizardStatusId_LockedToUser_61E99]
    ON [bpm].[Wizard]([IsDeleted] ASC, [WizardStatusId] ASC, [LockedToUser] ASC)
    INCLUDE([TenantId], [WizardConfigurationId], [LinkedItemId], [Name], [CurrentStepIndex], [CustomStatus], [CustomRoutingRoleId], [IsActive], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [StartDateAndTime], [EndDateAndTime]);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_TenantId_LinkedItemId_IsDeleted_WizardStatusId]
    ON [bpm].[Wizard]([TenantId] ASC, [LinkedItemId] ASC, [IsDeleted] ASC, [WizardStatusId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_WizardConfigurationId]
    ON [bpm].[Wizard]([WizardConfigurationId] ASC)
    INCLUDE([WizardStatusId], [LinkedItemId]);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_Name]
    ON [bpm].[Wizard]([Name] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_LinkedItemId_IsDeleted_WizardStatusId]
    ON [bpm].[Wizard]([LinkedItemId] ASC, [IsDeleted] ASC, [WizardStatusId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Wizard_WizardConfigurationId_IsDeleted_WizardStatusId]
    ON [bpm].[Wizard]([WizardConfigurationId] ASC, [IsDeleted] ASC, [WizardStatusId] ASC)
    INCLUDE([TenantId], [LinkedItemId], [Name], [CurrentStepIndex], [LockedToUser], [CustomStatus], [CustomRoutingRoleId], [IsActive], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [StartDateAndTime], [EndDateAndTime]);

