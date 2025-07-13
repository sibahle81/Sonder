CREATE TABLE [policy].[PolicyLifeExtension] (
    [PolicyLifeExtensionId]        INT           IDENTITY (1, 1) NOT NULL,
    [PolicyId]                     INT           NOT NULL,
    [AnnualIncreaseTypeId]         INT           NOT NULL,
    [AnnualIncreaseMonth]          INT           NULL,
    [AffordabilityCheckPassed]     BIT           CONSTRAINT [DF_PolicyLifeExtension_AffordabilityCheckPassed] DEFAULT ((1)) NOT NULL,
    [AffordabilityCheckFailReason] VARCHAR (250) NULL,
    [IsEuropAssistExtended]        BIT           CONSTRAINT [DF_PolicyLifeExtension_IsEuropAssistExtended] DEFAULT ((0)) NOT NULL,
    [IsDeleted]                    BIT           CONSTRAINT [DF_PolicyLifeExtension_IsDeleted] DEFAULT ((0)) NOT NULL,
    [CreatedBy]                    VARCHAR (50)  NOT NULL,
    [CreatedDate]                  DATETIME      CONSTRAINT [DF_PolicyLifeExtension_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                   VARCHAR (50)  NOT NULL,
    [ModifiedDate]                 DATETIME      CONSTRAINT [DF_PolicyLifeExtension_ModifiedDate] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_PolicyLifeExtension] PRIMARY KEY CLUSTERED ([PolicyLifeExtensionId] ASC),
    CONSTRAINT [FK_PolicyLifeExtension_AnnualIncreaseType] FOREIGN KEY ([AnnualIncreaseTypeId]) REFERENCES [common].[AnnualIncreaseType] ([Id]),
    CONSTRAINT [FK_PolicyLifeExtension_PolicyId] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [UC_PolicyId] UNIQUE NONCLUSTERED ([PolicyId] ASC)
);

