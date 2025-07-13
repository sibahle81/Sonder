CREATE TABLE [medical].[CML_Temp] (
    [CMLID]           INT           NOT NULL,
    [CMLCode]         VARCHAR (20)  NULL,
    [CMLDescription]  VARCHAR (100) NULL,
    [LastChangedBy]   VARCHAR (50)  NULL,
    [LastChangedDate] DATETIME      NULL,
    [IsActive]        BIT           NOT NULL,
    [IsDeleted]       BIT           NOT NULL,
    [CreatedBy]       VARCHAR (50)  NOT NULL,
    [CreatedDate]     DATETIME      NOT NULL,
    [ModifiedBy]      VARCHAR (50)  NOT NULL,
    [ModifiedDate]    DATETIME      NOT NULL,
    CONSTRAINT [PK_Medical_CML_CMLID] PRIMARY KEY CLUSTERED ([CMLID] ASC) WITH (FILLFACTOR = 95)
);

