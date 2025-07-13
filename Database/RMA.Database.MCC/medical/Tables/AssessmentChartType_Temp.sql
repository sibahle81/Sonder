CREATE TABLE [medical].[AssessmentChartType_Temp] (
    [AssessmentChartTypeId]      INT          NOT NULL,
    [Name]                       VARCHAR (50) NULL,
    [Description]                VARCHAR (50) NULL,
    [ClaimRequirementCategoryId] INT          NULL,
    [IsActive]                   BIT          NULL,
    [IsDeleted]                  BIT          NOT NULL,
    [CreatedBy]                  VARCHAR (50) NOT NULL,
    [CreatedDate]                DATETIME     NOT NULL,
    [ModifiedBy]                 VARCHAR (50) NOT NULL,
    [ModifiedDate]               DATETIME     NOT NULL,
    CONSTRAINT [PK_Medical_AssessmentChartType_Temp_AssessmentChartTypeId] PRIMARY KEY CLUSTERED ([AssessmentChartTypeId] ASC) WITH (FILLFACTOR = 95)
);

