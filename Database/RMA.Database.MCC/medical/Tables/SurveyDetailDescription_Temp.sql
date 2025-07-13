CREATE TABLE [medical].[SurveyDetailDescription_Temp] (
    [SurveyDetailDescriptionId] INT          IDENTITY (1, 1) NOT NULL,
    [PensionerId]               INT          NOT NULL,
    [SurveyQuestionId]          INT          NOT NULL,
    [Answer]                    NCHAR (1000) NOT NULL,
    [IsActive]                  BIT          NOT NULL,
    [IsDeleted]                 BIT          NOT NULL,
    [CreatedBy]                 VARCHAR (50) NOT NULL,
    [CreatedDate]               DATETIME     NOT NULL,
    [ModifiedBy]                VARCHAR (50) NOT NULL,
    [ModifiedDate]              DATETIME     NOT NULL,
    CONSTRAINT [PK_SurveyDetailDescription_Temp] PRIMARY KEY CLUSTERED ([SurveyDetailDescriptionId] ASC) WITH (FILLFACTOR = 95)
);

