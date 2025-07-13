CREATE TABLE [client].[QlinkReservationTransaction] (
    [QlinkReservationTransactionId] INT          IDENTITY (1, 1) NOT NULL,
    [QlinkParentTransactionId]      INT          NOT NULL,
    [QlinkChildTransactionId]       INT          NULL,
    [ReservationActivated]          BIT          DEFAULT ((0)) NOT NULL,
    [IsDeleted]                     BIT          DEFAULT ((0)) NOT NULL,
    [CreatedDate]                   DATETIME     DEFAULT (getdate()) NOT NULL,
    [CreatedBy]                     VARCHAR (50) NULL,
    [ModifiedDate]                  DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]                    VARCHAR (50) NOT NULL,
    PRIMARY KEY CLUSTERED ([QlinkReservationTransactionId] ASC),
    FOREIGN KEY ([QlinkChildTransactionId]) REFERENCES [client].[QlinkTransaction] ([QlinkTransactionId]),
    FOREIGN KEY ([QlinkParentTransactionId]) REFERENCES [client].[QlinkTransaction] ([QlinkTransactionId])
);

