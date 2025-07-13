CREATE TABLE [pension].[MonthEndRunRelease]
(
	[MonthEndReleaseId] INT NOT NULL  IDENTITY, 
    [MonthEndRunDateId] INT NOT NULL, 
    [MonthEndReleaseStatusId] INT NOT NULL, 
    [Amount] DECIMAL(11,0) NOT NULL,
    [IsActive] BIT NOT NULL, 
    [IsDeleted] BIT NOT NULL, 
    [CreatedBy] VARCHAR(50) NOT NULL, 
    [CreatedDate] DATETIME NOT NULL, 
    [ModifiedBy] VARCHAR(50) NOT NULL, 
    [ModifiedDate] DATETIME NOT NULL, 
    CONSTRAINT [PK_MonthEndRunRelease] PRIMARY KEY ([MonthEndReleaseId]), 
    CONSTRAINT [FK_MonthEndRunRelease_MonthEndRunDate] FOREIGN KEY ([MonthEndRunDateId]) REFERENCES [pension].[MonthEndRunDate]([MonthEndRunDateId]), 
    CONSTRAINT [FK_MonthEndRunRelease_MonthEndRunStatus] FOREIGN KEY ([MonthEndReleaseStatusId]) REFERENCES [common].[MonthEndRunStatus]([Id])
)
