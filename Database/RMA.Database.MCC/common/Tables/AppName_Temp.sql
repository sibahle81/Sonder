CREATE TABLE [common].[AppName_Temp] (
    [AppId]        TINYINT      IDENTITY (0, 1) NOT NULL,
    [AppName]      VARCHAR (25) NOT NULL,
    [IsActive]     BIT          NULL,
    [IsDeleted]    BIT          NOT NULL,
    [CreatedBy]    VARCHAR (50) NOT NULL,
    [CreatedDate]  DATETIME     NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([AppId] ASC) WITH (FILLFACTOR = 100)
);

