CREATE TABLE [medical].[DaysLookup_Temp] (
    [DaysLookupID]    INT          IDENTITY (1, 1) NOT NULL,
    [Minimum]         DECIMAL (18) NOT NULL,
    [Maximum]         DECIMAL (18) NOT NULL,
    [StartDate]       DATETIME     NOT NULL,
    [EndDate]         DATETIME     NOT NULL,
    [Average]         DECIMAL (18) NOT NULL,
    [LastChangedBy]   VARCHAR (30) NULL,
    [LastChangedDate] DATETIME     NULL,
    CONSTRAINT [PK_Compensation_DaysLookup_DaysLookupID] PRIMARY KEY CLUSTERED ([DaysLookupID] ASC) WITH (FILLFACTOR = 90, PAD_INDEX = ON)
);

