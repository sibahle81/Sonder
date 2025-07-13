CREATE TABLE [medical].[PreAuthChronicCMLDetail] (
    [PreAuthId]    INT          NOT NULL,
    [CMLId]        TINYINT      NOT NULL,
    [IsActive]     BIT          DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT          DEFAULT ((0)) NOT NULL,
    [CreatedBy]    VARCHAR (50) NOT NULL,
    [CreatedDate]  DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   VARCHAR (50) NOT NULL,
    [ModifiedDate] DATETIME     NOT NULL,
    CONSTRAINT [PK_medical_PreAuthChronicCMLDetail] PRIMARY KEY CLUSTERED ([PreAuthId] ASC, [CMLId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

