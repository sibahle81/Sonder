CREATE TABLE [medical].[PractitionerTypeIcd10ValidationExclusion] (
    [PractitionerTypeId] INT          NOT NULL,
    [IsActive]           BIT          NOT NULL,
    [CreatedBy]          VARCHAR (50) NOT NULL,
    [CreatedDate]        DATETIME     NOT NULL,
    [ModifiedBy]         VARCHAR (50) NOT NULL,
    [ModifiedDate]       DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([PractitionerTypeId] ASC),
    CONSTRAINT [FK_PractitionerTypeIcd10ValidationExclusion_PractitionerType] FOREIGN KEY ([PractitionerTypeId]) REFERENCES [medical].[PractitionerType] ([PractitionerTypeID])
);

