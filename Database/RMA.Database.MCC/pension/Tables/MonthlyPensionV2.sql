CREATE TABLE [pension].[MonthlyPensionV2]
(
	[MonthlyPensionId] INT NOT NULL IDENTITY, 
    [MonthEndRunDateId] INT NOT NULL, 
    [Amount] NUMERIC(11, 2) NOT NULL, 
    [ReleasedAmount] NUMERIC(11, 2) NOT NULL DEFAULT 0, 
    [IsDeleted] BIT NOT NULL, 
    [CreatedBy] VARCHAR(50) NOT NULL, 
    [CreatedDate] DATETIME NOT NULL, 
    [ModifiedBy] VARCHAR(50) NOT NULL, 
    [ModifiedDate] DATETIME NOT NULL, 
    CONSTRAINT [PK_MonthlyPensionV2] PRIMARY KEY ([MonthlyPensionId]), 
    CONSTRAINT [FK_MonthlyPensionV2_MonthEndRunDate] FOREIGN KEY (MonthEndRunDateId) REFERENCES [pension].[MonthEndRunDate](MonthEndRunDateId),

)
