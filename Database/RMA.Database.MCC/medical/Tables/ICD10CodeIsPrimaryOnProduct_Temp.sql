CREATE TABLE [medical].[ICD10CodeIsPrimaryOnProduct_Temp] (
    [ICD10CodeIsPrimaryOnProductID] INT          IDENTITY (1, 1) NOT NULL,
    [ICD10DiagnosticGroupID]        INT          NOT NULL,
    [ICD10CodeID]                   INT          NOT NULL,
    [ProductID]                     INT          NOT NULL,
    [EventCategoryID]               INT          NOT NULL,
    [IsPrimary]                     BIT          NOT NULL,
    [IsSecondary]                   BIT          NOT NULL,
    [LastChangedBy]                 VARCHAR (30) NULL,
    [LastChangedDate]               DATETIME     NULL,
    [IsActive]                      BIT          NOT NULL,
    [IsDeleted]                     BIT          NOT NULL,
    [CreatedBy]                     VARCHAR (50) NOT NULL,
    [CreatedDate]                   DATETIME     NOT NULL,
    [ModifiedBy]                    VARCHAR (50) NOT NULL,
    [ModifiedDate]                  DATETIME     NOT NULL,
    CONSTRAINT [PK_Medical_ICD10CodeIsPrimaryOnProduct_ICD10CodeIsPrimaryOnProductID] PRIMARY KEY CLUSTERED ([ICD10CodeIsPrimaryOnProductID] ASC) WITH (FILLFACTOR = 95),
    CONSTRAINT [FK_Medical_ICD10CodeIsPrimaryOnProduct_EventCategoryID] FOREIGN KEY ([EventCategoryID]) REFERENCES [common].[EventCategory] ([Id]),
    CONSTRAINT [FK_Medical_ICD10CodeIsPrimaryOnProduct_ICD10CodeID] FOREIGN KEY ([ICD10CodeID]) REFERENCES [medical].[ICD10Code] ([ICD10CodeID]),
    CONSTRAINT [FK_Medical_ICD10CodeIsPrimaryOnProduct_ICD10DiagnosticGroupID] FOREIGN KEY ([ICD10DiagnosticGroupID]) REFERENCES [medical].[ICD10DiagnosticGroup] ([ICD10DiagnosticGroupId]),
    CONSTRAINT [FK_Medical_ICD10CodeIsPrimaryOnProduct_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [common].[ProductCode_Temp] ([ProductCodeID]),
    CONSTRAINT [UK_Medical_ICD10CodeIsPrimaryOnProduct] UNIQUE NONCLUSTERED ([ICD10DiagnosticGroupID] ASC, [ProductID] ASC, [ICD10CodeID] ASC, [EventCategoryID] ASC, [IsPrimary] ASC, [IsSecondary] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

