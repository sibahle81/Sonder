CREATE TABLE [claim].[DaysOffCoverType] (
    [DaysOffCoverTypeId] INT             IDENTITY (1, 1) NOT NULL,
    [Name]               VARCHAR (50)    NOT NULL,
    [Description]        VARCHAR (100)   NOT NULL,
    [StartNoDays]        DECIMAL (10, 2) NULL,
    [EndNoDays]          DECIMAL (10, 2) NULL,
    [MinDaysOff]         DECIMAL (10, 2) NULL,
    [MaxDaysOff]         DECIMAL (10, 2) NULL,
    [CoverExcessTypeId]  INT             NOT NULL,
    [CreatedBy]          VARCHAR (50)    NOT NULL,
    [CreatedDate]        DATETIME        NOT NULL,
    [ModifiedBy]         VARCHAR (50)    NOT NULL,
    [ModifiedDate]       DATETIME        NOT NULL,
    CONSTRAINT [PK_DaysOffCoverType] PRIMARY KEY CLUSTERED ([DaysOffCoverTypeId] ASC),
    CONSTRAINT [FK_DaysOffCoverType_CoverExcessType] FOREIGN KEY ([CoverExcessTypeId]) REFERENCES [claim].[CoverExcessType] ([CoverExcessTypeId])
);

