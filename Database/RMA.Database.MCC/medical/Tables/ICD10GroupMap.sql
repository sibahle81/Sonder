CREATE TABLE [medical].[ICD10GroupMap] (
    [ICD10GroupMapId]        INT          IDENTITY (1, 1) NOT NULL,
    [ICD10CodeId]            INT          NOT NULL,
    [EventTypeId]            INT          NOT NULL,
    [ICD10DiagnosticGroupId] INT          NOT NULL,
    [IsActive]               BIT          CONSTRAINT [DF_ICD10DiagnosticGroupMapping_IsActive] DEFAULT ((1)) NOT NULL,
    [IsDeleted]              BIT          CONSTRAINT [DF_ICD10DiagnosticGroupMapping_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]              VARCHAR (50) NOT NULL,
    [CreatedDate]            DATETIME     CONSTRAINT [DF_ICD10DiagnosticGroupMapping_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             VARCHAR (50) NOT NULL,
    [ModifiedDate]           DATETIME     CONSTRAINT [DF_ICD10DiagnosticGroupMapping_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_ICD10DiagnosticGroupMapping] PRIMARY KEY CLUSTERED ([ICD10GroupMapId] ASC),
    CONSTRAINT [FK_ICD10DiagnosticGroupMapping_ICD10Code] FOREIGN KEY ([ICD10CodeId]) REFERENCES [medical].[ICD10Code] ([ICD10CodeID]),
    CONSTRAINT [FK_ICD10DiagnosticGroupMapping_ICD10DiagnosticGroup] FOREIGN KEY ([ICD10DiagnosticGroupId]) REFERENCES [medical].[ICD10DiagnosticGroup] ([ICD10DiagnosticGroupId]),
    CONSTRAINT [FK_ICD10GroupMap_EventType] FOREIGN KEY ([EventTypeId]) REFERENCES [common].[EventType] ([Id])
);










GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_ICD10GroupMap_CodeEventDRG]
    ON [medical].[ICD10GroupMap]([ICD10CodeId] ASC, [EventTypeId] ASC, [ICD10DiagnosticGroupId] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ModifiedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsDeleted';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'IsActive';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10GroupMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10GroupMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10GroupMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10GroupMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10GroupMapId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10GroupMapId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10DiagnosticGroupId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10CodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10CodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10CodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10CodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10CodeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'ICD10CodeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'EventTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'EventTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'EventTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'EventTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'EventTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'EventTypeId';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'RMAIsPOPI', @value = N'No', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataInformationType', @value = N'Unknown', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'RMADataClassification', @value = N'Internal', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataSource', @value = N'Modernization', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwnerDepartment', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
EXECUTE sp_addextendedproperty @name = N'DataOwner', @value = N'UnClassified', @level0type = N'SCHEMA', @level0name = N'medical', @level1type = N'TABLE', @level1name = N'ICD10GroupMap', @level2type = N'COLUMN', @level2name = N'CreatedBy';


GO
CREATE NONCLUSTERED INDEX [IX_ICD10GroupMap_ICD10DiagnosticGroupId_IsActive_IsDeleted_2D1FE]
    ON [medical].[ICD10GroupMap]([ICD10DiagnosticGroupId] ASC, [IsActive] ASC, [IsDeleted] ASC)
    INCLUDE([ICD10CodeId], [EventTypeId]);


GO
CREATE NONCLUSTERED INDEX [IX_ICD10GroupMap_EventTypeId_IsDeleted_76DE9]
    ON [medical].[ICD10GroupMap]([EventTypeId] ASC, [IsDeleted] ASC)
    INCLUDE([ICD10CodeId]);


GO
CREATE NONCLUSTERED INDEX [IX_ICD10GroupMap_EventTypeId_IsActive_IsDeleted_0DC32]
    ON [medical].[ICD10GroupMap]([EventTypeId] ASC, [IsActive] ASC, [IsDeleted] ASC)
    INCLUDE([ICD10DiagnosticGroupId]);


GO
CREATE NONCLUSTERED INDEX [IX_ICD10GroupMap_EventTypeId_ICD10DiagnosticGroupId_IsActive_IsDeleted_69A65]
    ON [medical].[ICD10GroupMap]([EventTypeId] ASC, [ICD10DiagnosticGroupId] ASC, [IsActive] ASC, [IsDeleted] ASC)
    INCLUDE([ICD10CodeId]);


GO
CREATE NONCLUSTERED INDEX [IX_ICD10GroupMap_EventTypeId_ICD10DiagnosticGroupId_A06CF]
    ON [medical].[ICD10GroupMap]([EventTypeId] ASC, [ICD10DiagnosticGroupId] ASC)
    INCLUDE([ICD10CodeId]);

