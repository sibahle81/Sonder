CREATE TABLE [claim].[PersonEventSTPExitReasons] (
    [ClaimSTPExitReasonID] INT          IDENTITY (1, 1) NOT NULL,
    [PersonEventID]        INT          NOT NULL,
    [STPExitReasonID]      INT          NOT NULL,
    [IsDeleted]            BIT          DEFAULT ((0)) NOT NULL,
    [CreatedBy]            VARCHAR (50) NOT NULL,
    [CreatedDate]          DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]           VARCHAR (50) NOT NULL,
    [ModifiedDate]         DATETIME     DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([ClaimSTPExitReasonID] ASC),
    CONSTRAINT [FK_PersonEventSTPExitReasons_PersonEvent] FOREIGN KEY ([PersonEventID]) REFERENCES [claim].[PersonEvent] ([PersonEventId]),
    CONSTRAINT [FK_PersonEventSTPExitReasons_STPExitReason] FOREIGN KEY ([STPExitReasonID]) REFERENCES [claim].[STPExitReason] ([STPExitReasonID])
);


GO


GO


GO


GO


GO


GO


GO


GO
CREATE NONCLUSTERED INDEX [IX_PersonEventSTPExitReasons_PersonEventID_IsDeleted]
    ON [claim].[PersonEventSTPExitReasons]([PersonEventID] ASC, [IsDeleted] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_PersonEventSTPExitReasons_CreatedDate]
    ON [claim].[PersonEventSTPExitReasons]([CreatedDate] ASC)
    INCLUDE([PersonEventID], [STPExitReasonID]);

