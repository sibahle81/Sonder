CREATE TABLE [medical].[Nappi_Temp] (
    [NappiId]       INT           IDENTITY (1, 1) NOT NULL,
    [FileName]      VARCHAR (255) NOT NULL,
    [StatusMessage] VARCHAR (255) NULL,
    [RequestDate]   DATETIME      NOT NULL,
    [IsActive]      BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]     BIT           DEFAULT ((0)) NOT NULL,
    [CreatedBy]     VARCHAR (50)  NOT NULL,
    [CreatedDate]   DATETIME      DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]    VARCHAR (50)  NOT NULL,
    [ModifiedDate]  DATETIME      NOT NULL,
    CONSTRAINT [PK_medical_Nappi] PRIMARY KEY CLUSTERED ([NappiId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

