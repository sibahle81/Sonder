CREATE TABLE [medical].[SurveyLanguage_Temp] (
    [SurveyLanguageId] INT          IDENTITY (1, 1) NOT NULL,
    [Name]             NCHAR (50)   NOT NULL,
    [SurveyFormTitle]  NCHAR (50)   NOT NULL,
    [IsActive]         BIT          NOT NULL,
    [IsDeleted]        BIT          NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     NOT NULL,
    CONSTRAINT [PK_SurveyLanguage_Temp] PRIMARY KEY CLUSTERED ([SurveyLanguageId] ASC) WITH (FILLFACTOR = 95)
);

