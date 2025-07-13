CREATE TABLE [commission].[CommSchedule] (
    [ID]          INT          IDENTITY (1, 1) NOT NULL,
    [ConfigID]    INT          NOT NULL,
    [RunSchedule] DATETIME     NOT NULL,
    [CommBatch]   INT          NULL,
    [PolicyCount] INT          NULL,
    [Result]      VARCHAR (30) NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_CommSchedule]
    ON [commission].[CommSchedule]([ID] ASC, [RunSchedule] ASC);

