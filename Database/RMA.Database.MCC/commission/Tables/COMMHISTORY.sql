CREATE TABLE [commission].[COMMHISTORY] (
    [PolicyNumber]  VARCHAR (35)    NULL,
    [Membertype]    VARCHAR (35)    NULL,
    [DOB]           DATE            NULL,
    [YEASRSTOEXIT]  INT             NULL,
    [PREMIUM]       DECIMAL (14, 2) NULL,
    [LTCOMM]        DECIMAL (14, 2) NULL,
    [FIRSTYRCOMM]   DECIMAL (14, 2) NULL,
    [PRIMARYCOMM]   DECIMAL (14, 2) NULL,
    [INCEPTIONDATE] DATE            NULL,
    [CAPTUREDATE]   DATE            NULL,
    [COMMBATCH]     INT             NULL
);

