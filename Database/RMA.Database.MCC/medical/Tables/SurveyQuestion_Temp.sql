CREATE TABLE [medical].[SurveyQuestion_Temp] (
    [SurveyQuestionID] INT          IDENTITY (1, 1) NOT NULL,
    [Description]      NCHAR (400)  NOT NULL,
    [SurveyLanguageID] INT          NOT NULL,
    [QuestionType]     CHAR (1)     NOT NULL,
    [Sequence]         TINYINT      NOT NULL,
    [IsActive]         BIT          NOT NULL,
    [IsDeleted]        BIT          NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     NOT NULL,
    CONSTRAINT [PK_SurveyQuestion] PRIMARY KEY CLUSTERED ([SurveyQuestionID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

