CREATE TABLE [common].[MonthlyScheduledWorkPoolUser] (
    [MonthlyScheduledWorkPoolUserId] INT          IDENTITY (1, 1) NOT NULL,
    [WorkPoolId]                     INT          NOT NULL,
    [StartDate]                      DATETIME     NOT NULL,
    [EndDate]                        DATETIME     NOT NULL,
    [AssignedByUserId]               INT          NOT NULL,
    [AssignedToUserId]               INT          NOT NULL,
    [IsDeleted]                      BIT          NOT NULL,
    [CreatedBy]                      VARCHAR (50) NOT NULL,
    [CreatedDate]                    DATETIME     NOT NULL,
    [ModifiedBy]                     VARCHAR (50) NOT NULL,
    [ModifiedDate]                   DATETIME     NOT NULL,
    CONSTRAINT [PK_MonthlyScheduledWorkPoolUser] PRIMARY KEY CLUSTERED ([MonthlyScheduledWorkPoolUserId] ASC)
);

