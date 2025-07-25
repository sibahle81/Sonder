﻿CREATE TABLE [medical].[MISwitchBatchBackup_Temp] (
    [MISwitchBatchId]   INT                                        IDENTITY (1, 1) NOT NULL,
    [Description]       VARCHAR (2048)                             NULL,
    [SwitchBatchNo]     VARCHAR (50)                               NULL,
    [SwitchFileName]    VARCHAR (127)                              NULL,
    [DateSubmitted]     DATETIME                                   NULL,
    [DateSwitched]      DATETIME                                   NULL,
    [DateReceived]      DATETIME                                   NULL,
    [DateCompleted]     DATETIME                                   NULL,
    [InvoicesStated]    DECIMAL (7, 2)                             NOT NULL,
    [InvoicesCounted]   DECIMAL (7, 2)                             NOT NULL,
    [AmountStatedIncl]  MONEY MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [AmountCountedIncl] MONEY MASKED WITH (FUNCTION = 'default()') NOT NULL,
    [AssignedUserID]    INT                                        NULL,
    [DateCaptured]      DATETIME                                   NULL,
    [MedicalSwitchId]   INT                                        NULL,
    [LinesStated]       DECIMAL (7, 2)                             NOT NULL,
    [LinesCounted]      DECIMAL (7, 2)                             NOT NULL,
    [AssignedToRoleID]  INT                                        NULL,
    [IsActive]          BIT                                        DEFAULT ((1)) NOT NULL,
    [IsDeleted]         BIT                                        DEFAULT ((0)) NOT NULL,
    [CreatedBy]         VARCHAR (50)                               NOT NULL,
    [CreatedDate]       DATETIME                                   DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]        VARCHAR (50)                               NOT NULL,
    [ModifiedDate]      DATETIME                                   NOT NULL
);

