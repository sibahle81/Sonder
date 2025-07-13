CREATE TABLE [claim].[Earnings] (
    [EarningId]           INT          IDENTITY (1, 1) NOT NULL,
    [PersonEventId]       INT          NOT NULL,
    [VariableSubTotal]    MONEY        NULL,
    [NonVariableSubTotal] MONEY        NULL,
    [Total]               MONEY        NULL,
    [IsVerified]          BIT          CONSTRAINT [DF_Earnings_IsVerified] DEFAULT ((0)) NOT NULL,
    [IsDeleted]           BIT          NOT NULL,
    [CreatedBy]           VARCHAR (50) NOT NULL,
    [CreatedDate]         DATETIME     NOT NULL,
    [ModifiedBy]          VARCHAR (50) NOT NULL,
    [ModifiedDate]        DATETIME     NOT NULL,
    [IsEstimated]         BIT          CONSTRAINT [EarningsIsEstimated] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK__Earnings__2418A122E70367B8] PRIMARY KEY CLUSTERED ([EarningId] ASC),
    CONSTRAINT [FK_Earnings_PersonEvent] FOREIGN KEY ([PersonEventId]) REFERENCES [claim].[PersonEvent] ([PersonEventId])
);






GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO



GO


