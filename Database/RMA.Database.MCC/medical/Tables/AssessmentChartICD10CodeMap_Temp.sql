CREATE TABLE [medical].[AssessmentChartICD10CodeMap_Temp] (
    [AssessmentChartICD10CodeMapId] INT          IDENTITY (1, 1) NOT NULL,
    [AssessmentChartTypeId]         INT          NOT NULL,
    [ICD10CodeId]                   INT          NOT NULL,
    [IsActive]                      BIT          NULL,
    [IsDeleted]                     BIT          NOT NULL,
    [CreatedBy]                     VARCHAR (50) NOT NULL,
    [CreatedDate]                   DATETIME     NOT NULL,
    [ModifiedBy]                    VARCHAR (50) NOT NULL,
    [ModifiedDate]                  DATETIME     NOT NULL,
    CONSTRAINT [PK_Medical_AssessmentChartICD10CodeMap_Temp_AssessmentChartICD10CodeMapId] PRIMARY KEY CLUSTERED ([AssessmentChartICD10CodeMapId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

