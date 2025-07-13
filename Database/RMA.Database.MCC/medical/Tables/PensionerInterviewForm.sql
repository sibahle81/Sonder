CREATE TABLE [medical].[PensionerInterviewForm] (
    [PensionerInterviewFormId] INT            IDENTITY (1, 1) NOT NULL,
    [PensionerId]              INT            NOT NULL,
    [InterviewDate]            DATETIME       NOT NULL,
    [Relocation]               TINYINT        NULL,
    [ChronicMedicine]          VARCHAR (2048) NULL,
    [FurtherTreatment]         VARCHAR (2048) NULL,
    [Transporting]             VARCHAR (2048) NULL,
    [BranchId]              INT            NULL,
    [TebaLocationId]           INT            NOT NULL,
    [InfoBrochure]             VARCHAR (2048) NULL,
    [COL]                      VARCHAR (2048) NULL,
    [IsActive]                 BIT            DEFAULT ((1)) NOT NULL,
    [IsDeleted]                BIT            DEFAULT ((0)) NOT NULL,
    [CreatedBy]                VARCHAR (50)   NOT NULL,
    [CreatedDate]              DATETIME       DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]               VARCHAR (50)   NOT NULL,
    [ModifiedDate]             DATETIME       NOT NULL,
    CONSTRAINT [PK_medical_PensionerInterviewForm] PRIMARY KEY CLUSTERED ([PensionerInterviewFormId] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON),
    CONSTRAINT [FK_PensionerInterviewForm_Pensioner] FOREIGN KEY ([PensionerId]) REFERENCES [pension].[Pensioner] ([PensionerId])
);

