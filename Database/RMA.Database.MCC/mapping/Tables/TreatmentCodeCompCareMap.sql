CREATE TABLE [mapping].[TreatmentCodeCompCareMap] (
    [TreatmentCodeCompCareMapId] INT          IDENTITY (1, 1) NOT NULL,
    [TreatmentCodeId]            INT          NOT NULL,
    [CompCareTreatmentCodeId]    INT          NOT NULL,
    [IsDeleted]                  BIT          NOT NULL,
    [CreatedBy]                  VARCHAR (50) NOT NULL,
    [CreatedDate]                DATETIME     NOT NULL,
    [ModifiedBy]                 VARCHAR (50) NOT NULL,
    [ModifiedDate]               DATETIME     NOT NULL,
    CONSTRAINT [PK_TreatmentCodeCompCareMap] PRIMARY KEY CLUSTERED ([TreatmentCodeCompCareMapId] ASC),
    CONSTRAINT [FK_TreatmentCodeCompCareMap_TreatmentCode] FOREIGN KEY ([TreatmentCodeId]) REFERENCES [medical].[TreatmentCode] ([TreatmentCodeId])
);




GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'TreatmentCodeCompCareMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareTreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareTreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareTreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareTreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareTreatmentCodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'mapping', @level1type = N'TABLE', @level1name = N'TreatmentCodeCompCareMap', @level2type = N'COLUMN', @level2name = N'CompCareTreatmentCodeId';

