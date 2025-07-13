CREATE TABLE [common].[DepartmentLookup] (
    [DepartmentLookUpId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]               NVARCHAR (100) NULL,
    [Decription]         NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_DepartmentLookup] PRIMARY KEY CLUSTERED ([DepartmentLookUpId] ASC)
);

