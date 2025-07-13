CREATE TABLE [claim].[ClaimRequiredDocument] (
    [ClaimRequiredDocumentId]    BIGINT IDENTITY (1, 1) NOT NULL,
    [PersoneventId]              INT    NULL,
    [ClaimRequirementCategoryId] INT    NULL,
    [Isuploaded]                 BIT    NULL,
    [DocumentDocumentTypeId]     INT    NULL,
    CONSTRAINT [fk_ClaimRequirementCategoryId] FOREIGN KEY ([ClaimRequirementCategoryId]) REFERENCES [claim].[ClaimRequirementCategory] ([ClaimRequirementCategoryId]),
    CONSTRAINT [fk_PersoneventId] FOREIGN KEY ([PersoneventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);

