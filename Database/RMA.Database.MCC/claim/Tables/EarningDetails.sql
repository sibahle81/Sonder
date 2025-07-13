CREATE TABLE [claim].[EarningDetails] (
    [EarningDetailId]  INT          IDENTITY (1, 1) NOT NULL,
    [EarningId]        INT          NOT NULL,
    [EarningTypeId]    INT          NOT NULL,
    [OtherDescription] VARCHAR (30) NULL,
    [Month]            VARCHAR (30) NULL,
    [Amount]           MONEY        NULL,
    [IsDeleted]        BIT          NOT NULL,
    [CreatedBy]        VARCHAR (50) NOT NULL,
    [CreatedDate]      DATETIME     NOT NULL,
    [ModifiedBy]       VARCHAR (50) NOT NULL,
    [ModifiedDate]     DATETIME     NOT NULL,
    PRIMARY KEY CLUSTERED ([EarningDetailId] ASC),
    FOREIGN KEY ([EarningTypeId]) REFERENCES [claim].[EarningTypes] ([EarningTypeId]),
    CONSTRAINT [FK__EarningDe__Earni__5F42FA94] FOREIGN KEY ([EarningId]) REFERENCES [claim].[Earnings] ([EarningId])
);

