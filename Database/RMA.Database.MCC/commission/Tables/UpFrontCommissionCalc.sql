CREATE TABLE [commission].[UpFrontCommissionCalc] (
    [id]                    INT             IDENTITY (1, 1) NOT NULL,
    [PolicyImportBatch]     INT             NULL,
    [PolicyImportRow]       BIGINT          NULL,
    [PolicyNumber]          VARCHAR (18)    NOT NULL,
    [MemberType]            VARCHAR (35)    NOT NULL,
    [MemberRecord]          VARCHAR (50)    NOT NULL,
    [CommTypeID]            INT             NOT NULL,
    [LifeDOB]               DATE            NULL,
    [YearstoExit]           INT             NULL,
    [CommissionablePremium] DECIMAL (14, 2) NULL,
    [LTComm]                DECIMAL (14, 2) NULL,
    [YR85Comm]              DECIMAL (14, 2) NULL,
    [PrimaryComm]           DECIMAL (14, 2) NULL,
    [SecondaryComm]         DECIMAL (14, 2) NULL,
    [CommDue]               DECIMAL (14, 2) NULL,
    [PrevComm]              DECIMAL (14, 2) NULL,
    [CommBalance]           DECIMAL (14, 2) NULL,
    [Retention]             DECIMAL (14, 2) NULL,
    [PolicyCaptureDate]     DATE            NULL,
    [PolicyInceptionDate]   DATE            NULL,
    [PolicyCancelDate]      DATE            NULL,
    [CalcDate]              DATE            NULL,
    [CommStatus]            VARCHAR (25)    NULL,
    [PolicyCommissionID]    INT             NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IDX_CommissionCalc_CalcDate]
    ON [commission].[UpFrontCommissionCalc]([CalcDate] ASC);


GO
CREATE NONCLUSTERED INDEX [IDX_CommissionCalc_CommTypeID]
    ON [commission].[UpFrontCommissionCalc]([CommTypeID] ASC);


GO
CREATE NONCLUSTERED INDEX [IDX_CommissionCalc_PolicyNumber]
    ON [commission].[UpFrontCommissionCalc]([PolicyNumber] ASC);

