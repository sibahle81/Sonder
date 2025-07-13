CREATE TABLE [claim].[AnnuityFactor] (
    [AnnuityFactorId]            INT             NOT NULL,
    [AnnuityAge]                 INT             NOT NULL,
    [StartDate]                  DATETIME        NOT NULL,
    [EndDate]                    DATETIME        NOT NULL,
    [MenAnnuityFactor]           DECIMAL (10, 2) CONSTRAINT [DF_AnnuityFactor_MenAnnuityFactor] DEFAULT ((0)) NOT NULL,
    [WidowAnnuityFactor]         DECIMAL (10, 2) CONSTRAINT [DF_AnnuityFactor_WidowAnnuityFactor] DEFAULT ((0)) NOT NULL,
    [ChildAnnuityFactor]         DECIMAL (10, 2) CONSTRAINT [DF_AnnuityFactor_ChildAnnuityFacoty] DEFAULT ((0)) NOT NULL,
    [DateCaptured]               DATETIME        NOT NULL,
    [Description]                VARCHAR (255)   NOT NULL,
    [AnnuityFactorTypeId]        INT             NOT NULL,
    [RORPercent]                 DECIMAL (10, 2) CONSTRAINT [DF_AnnuityFactor_RORPercent] DEFAULT ((0)) NOT NULL,
    [DisabledChildAnnuityFactor] DECIMAL (10, 2) CONSTRAINT [DF_AnnuityFactor_DisabledChildAnnuityFactor] DEFAULT ((0)) NOT NULL,
    [IsDeleted]                  BIT             NOT NULL,
    [CreatedBy]                  VARCHAR (50)    NOT NULL,
    [CreatedDate]                DATETIME        NOT NULL,
    [ModifiedBy]                 VARCHAR (50)    NOT NULL,
    [ModifiedDate]               DATETIME        NOT NULL,
    CONSTRAINT [PK__AnnuityFactor] PRIMARY KEY CLUSTERED ([AnnuityFactorId] ASC),
    CONSTRAINT [FK_AnnuityFactor_AnnuityFactorType] FOREIGN KEY ([AnnuityFactorTypeId]) REFERENCES [claim].[AnnuityFactorType] ([AnnuityFactorTypeId])
);

