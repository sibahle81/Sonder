CREATE TABLE [Load].[GPA] (
    [Id]                INT              IDENTITY (1, 1) NOT NULL,
    [FileIdentifier]    UNIQUEIDENTIFIER NOT NULL,
    [ClientReference]   NVARCHAR (50)    NOT NULL,
    [Company]           NVARCHAR (50)    NOT NULL,
    [EmployeeNumber]    NVARCHAR (50)    NOT NULL,
    [IdNumber]          NVARCHAR (20)    NOT NULL,
    [IdType]            NVARCHAR (20)    NULL,
    [DateOfBirth]       NVARCHAR (32)    NULL,
    [Gender]            NVARCHAR (100)   NULL,
    [FirstName]         NVARCHAR (50)    NOT NULL,
    [LastName]          NVARCHAR (50)    NOT NULL,
    [Cell]              NVARCHAR (20)    NOT NULL,
    [Email]             NVARCHAR (50)    NOT NULL,
    [MonthlyRiskSalary] INT              NOT NULL,
    [DIContribution]    NVARCHAR (50)    NOT NULL,
    [DIOption]          NVARCHAR (10)    NOT NULL,
    [EmployeeStartDate] NVARCHAR (32)    NOT NULL,
    [Escalation]        NVARCHAR (50)    NULL,
    [ExcelRowNumber]    INT              NOT NULL,
    CONSTRAINT [PK_GPA] PRIMARY KEY CLUSTERED ([Id] ASC)
);

