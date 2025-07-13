CREATE TABLE [client].[PersalCutOffDate] (
    [PersalCutOffDateId] INT          IDENTITY (1, 1) NOT NULL,
    [SalaryMonth]        DATETIME     NOT NULL,
    [CutOffDate]         DATETIME     NOT NULL,
    [IsDeleted]          BIT          DEFAULT ((0)) NOT NULL,
    [CreatedDate]        DATETIME     DEFAULT (getdate()) NOT NULL,
    [CreatedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]       DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]         VARCHAR (50) NOT NULL,
    UNIQUE NONCLUSTERED ([CutOffDate] ASC),
    UNIQUE NONCLUSTERED ([SalaryMonth] ASC)
);

