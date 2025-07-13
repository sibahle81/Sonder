CREATE TABLE [medical].[SystemParameter_Temp] (
    [SystemParameterID] INT           IDENTITY (1, 1) NOT NULL,
    [Name]              VARCHAR (50)  NOT NULL,
    [ParameterValue]    VARCHAR (200) NOT NULL,
    [ParameterSeriesNo] INT           NULL,
    [Description]       VARCHAR (200) NOT NULL,
    [IsActive]          BIT           NOT NULL,
    [IsDeleted]         BIT           NOT NULL,
    [CreatedBy]         VARCHAR (50)  NOT NULL,
    [CreatedDate]       DATETIME      NOT NULL,
    [ModifiedBy]        VARCHAR (50)  NOT NULL,
    [ModifiedDate]      DATETIME      NOT NULL,
    CONSTRAINT [PK_Compensation_SystemParameter_SystemParameterID] PRIMARY KEY CLUSTERED ([SystemParameterID] ASC) WITH (FILLFACTOR = 95)
);

