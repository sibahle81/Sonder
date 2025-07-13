CREATE TABLE [medical].[PractitionerTypeRCodeMapping] (
    [PractitionerTypeID] INT          NOT NULL,
    [ICD10Code]          VARCHAR (20) NOT NULL,
    [IsActive]           BIT          DEFAULT ((0)) NOT NULL,
    [IsDeleted]          BIT          NOT NULL,
    [CreatedBy]          VARCHAR (50) NOT NULL,
    [CreatedDate]        DATETIME     NOT NULL,
    [ModifiedBy]         VARCHAR (50) NOT NULL,
    [ModifiedDate]       DATETIME     NOT NULL,
    CONSTRAINT [Comp_Key_PractitionerTypeID_ICD10Code] PRIMARY KEY CLUSTERED ([PractitionerTypeID] ASC, [ICD10Code] ASC),
    CONSTRAINT [FK_PractitionerTypeRCodeMapping_PractitionerType] FOREIGN KEY ([PractitionerTypeID]) REFERENCES [medical].[PractitionerType] ([PractitionerTypeID])
);

