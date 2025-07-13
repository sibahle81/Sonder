CREATE TABLE [medical].[ChronicMedicationList] (
    [CMLId]        INT            IDENTITY (1, 1) NOT NULL,
    [Name]         VARCHAR (50)   NOT NULL,
    [Description]  VARCHAR (2048) NOT NULL,
    [IsActive]     BIT            DEFAULT ((1)) NULL,
    [IsDeleted]    BIT            DEFAULT ((0)) NOT NULL,
    [CreatedBy]    VARCHAR (50)   NOT NULL,
    [CreatedDate]  DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   VARCHAR (50)   NOT NULL,
    [ModifiedDate] DATETIME       NOT NULL,
    CONSTRAINT [PK_ChronicMedicationList] PRIMARY KEY CLUSTERED ([CMLId] ASC) WITH (FILLFACTOR = 95)
);

