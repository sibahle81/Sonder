CREATE TABLE [medical].[SOLPreAuthException_Temp] (
    [PreAuthException]      INT           IDENTITY (1, 1) NOT NULL,
    [PreAuthNumber]         VARCHAR (20)  NULL,
    [NappiCodeOrBasketCode] VARCHAR (20)  NULL,
    [HeaderId]              INT           NULL,
    [DetailId]              INT           NULL,
    [ReasonFailedCode]      NVARCHAR (20) NULL,
    [IsActive]              BIT           NOT NULL,
    [IsDeleted]             BIT           NOT NULL,
    [CreatedBy]             VARCHAR (50)  NOT NULL,
    [CreatedDate]           DATETIME      NOT NULL,
    [ModifiedBy]            VARCHAR (50)  NOT NULL,
    [ModifiedDate]          DATETIME      NOT NULL,
    CONSTRAINT [PK_SOLPreAuthException_Temp] PRIMARY KEY CLUSTERED ([PreAuthException] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

