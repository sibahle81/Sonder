CREATE TABLE [medical].[SOLHeaderRecords_Temp] (
    [HeaderId]      INT           IDENTITY (1, 1) NOT NULL,
    [FileName]      VARCHAR (250) NULL,
    [HeaderRecords] XML           NULL,
    [FooterRecords] XML           NULL,
    [FileDate]      DATETIME      NULL,
    [User]          VARCHAR (50)  NULL,
    [IsActive]      BIT           NOT NULL,
    [IsDeleted]     BIT           NOT NULL,
    [CreatedBy]     VARCHAR (50)  NOT NULL,
    [CreatedDate]   DATETIME      NOT NULL,
    [ModifiedBy]    VARCHAR (50)  NOT NULL,
    [ModifiedDate]  DATETIME      NOT NULL,
    CONSTRAINT [PK_medical.SOLHeaderRecords_Temp] PRIMARY KEY CLUSTERED ([HeaderId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

