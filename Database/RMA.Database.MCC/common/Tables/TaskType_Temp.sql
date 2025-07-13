CREATE TABLE [common].[TaskType_Temp] (
    [TaskTypeId]   INT            IDENTITY (1, 1) NOT NULL,
    [Name]         VARCHAR (50)   NOT NULL,
    [Description]  VARCHAR (2048) NULL,
    [IsActive]     TINYINT        NOT NULL,
    [IsDeleted]    BIT            NOT NULL,
    [CreatedBy]    VARCHAR (50)   NOT NULL,
    [CreatedDate]  DATETIME       NOT NULL,
    [ModifiedBy]   VARCHAR (50)   NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_common_TaskType_Temp_TaskTypeId] PRIMARY KEY CLUSTERED ([TaskTypeId] ASC) WITH (FILLFACTOR = 95)
);

