CREATE TABLE [mapping].[HealthCareProviderCompCareMap] (
    [HealthCareProviderCompCareMapId] INT          IDENTITY (1, 1) NOT NULL,
    [HealthCareProviderId]            INT          NOT NULL,
    [CompCareMSPId]                   INT          NOT NULL,
    [IsDeleted]                       BIT          NOT NULL,
    [CreatedBy]                       VARCHAR (50) NOT NULL,
    [CreatedDate]                     DATETIME     NOT NULL,
    [ModifiedBy]                      VARCHAR (50) NOT NULL,
    [ModifiedDate]                    DATETIME     NOT NULL,
    CONSTRAINT [PK_Mapping_HealthCareProviderCompCareMap] PRIMARY KEY CLUSTERED ([HealthCareProviderCompCareMapId] ASC),
    CONSTRAINT [FK_HealthCareProviderCompCareMap_HealthCareProvider] FOREIGN KEY ([HealthCareProviderId]) REFERENCES [medical].[HealthCareProvider] ([RolePlayerId])
);




GO
CREATE NONCLUSTERED INDEX [IX_HealthCareProviderId]
    ON [mapping].[HealthCareProviderCompCareMap]([HealthCareProviderId] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'HealthCareProviderCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareMSPId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareMSPId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareMSPId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareMSPId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareMSPId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'HealthCareProviderCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareMSPId';

