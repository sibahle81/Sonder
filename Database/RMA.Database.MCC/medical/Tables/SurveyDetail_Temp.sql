CREATE TABLE [medical].[SurveyDetail_Temp] (
    [SurveyDetailId]   INT          IDENTITY (1, 1) NOT NULL,
    [PensionerId]      INT          NOT NULL,
    [SurveyQuestionId] INT          NOT NULL,
    [Answer]           TINYINT      NOT NULL,
    [IsActive]         BIT          NOT NULL,
    [IsDeleted]        BIT          NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     NOT NULL,
    CONSTRAINT [PK_SurveyDetail_Temp] PRIMARY KEY CLUSTERED ([SurveyDetailId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

