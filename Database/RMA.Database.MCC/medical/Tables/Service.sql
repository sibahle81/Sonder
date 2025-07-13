CREATE TABLE [medical].[Service] (
    [ServiceId]    INT           IDENTITY (1, 1) NOT NULL,
    [PMPServiceId] INT           NULL,
    [Name]         VARCHAR (50)  NOT NULL,
    [Description]  VARCHAR (255) NULL,
    [Code]         CHAR (10)     NULL,
    [IsActive]     BIT           NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (50)  NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (50)  NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK_medical_Service_Temp_ServiceId] PRIMARY KEY CLUSTERED ([ServiceId] ASC) WITH (FILLFACTOR = 95)
);

