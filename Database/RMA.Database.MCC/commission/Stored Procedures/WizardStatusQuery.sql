CREATE procedure commission.WizardStatusQuery
as 

-- Region Parameters
DECLARE @p0 Int = 0
DECLARE @p1 Int = 0
DECLARE @p2 Int = 113
DECLARE @p3 VarChar(1000) = '%Matla%'
DECLARE @p4 DateTime = '2023-01-01 00:00:00.000' -- start date
DECLARE @p5 NVarChar(1000) = ''
DECLARE @p6 DateTime = '1900-01-01 00:00:00.000'
DECLARE @p7 DateTime = '1900-01-01 00:00:00.000'
DECLARE @p8 NVarChar(1000) = ''
DECLARE @p9 NVarChar(1000) = ''
DECLARE @p10 DateTime = '1900-01-01 00:00:00.000'
DECLARE @p11 NVarChar(1000) = ''
DECLARE @p12 DateTime = '1900-01-01 00:00:00.000'
DECLARE @p13 NVarChar(1000) = ''
DECLARE @p14 NVarChar(1000) = ''
DECLARE @p15 DateTime = '1900-01-01 00:00:00.000'
DECLARE @p16 NVarChar(1000) = '400'
DECLARE @p17 NVarChar(1000) = 'Success'
DECLARE @p18 NVarChar(1000) = 'Failed'
DECLARE @p19 NVarChar(1000) = ''
-- EndRegion
SELECT  distinct [t4].[MessageBody] AS [Reference], [t4].[EnqueuedTime] AS [DateReceived], [t4].[MainMemberIdNumber] AS [MainMemberIdNumber], 
    (CASE 
        WHEN [t11].[test] IS NOT NULL THEN CONVERT(NVarChar(200),[t11].[Name])
        ELSE CONVERT(NVarChar(200),@p5)
     END) AS [WizardName], 
    (CASE 
        WHEN ([t11].[CreatedDate]) IS NULL THEN @p6
        ELSE [t11].[CreatedDate]
     END) AS [WizardCreatedDate], 
    (CASE 
        WHEN ([t11].[ModifiedDate]) IS NULL THEN @p7
        ELSE [t11].[ModifiedDate]
     END) AS [WizardLastStatusDate], 
    (CASE 
        WHEN [t11].[test] IS NOT NULL THEN CONVERT(NVarChar(50),[t11].[Name2])
        ELSE CONVERT(NVarChar(50),@p8)
     END) AS [WizardStatus], 
    (CASE 
        WHEN [t4].[test] IS NOT NULL THEN CONVERT(NVarChar(256),[t4].[ErrorMessage])
        ELSE CONVERT(NVarChar(256),@p9)
     END) AS [ErrorMessage], 
    (CASE 
        WHEN [t4].[test] IS NOT NULL THEN [t4].[ErrorDate]
        ELSE @p10
     END) AS [ErrorDate], 
    (CASE 
        WHEN [t8].[test] IS NOT NULL THEN CONVERT(NVarChar(50),[t8].[PolicyNumber])
        ELSE CONVERT(NVarChar(50),@p11)
     END) AS [policyNumber], 
    (CASE 
        WHEN [t8].[test] IS NOT NULL THEN [t8].[CreatedDate2]
        ELSE @p12
     END) AS [policyCreatedDate], 
    (CASE 
        WHEN [t8].[test] IS NOT NULL THEN CONVERT(NVarChar,[t8].[QlinkTransactionId])
        ELSE CONVERT(NVarChar(MAX),@p13)
     END) AS [QlinkTransactionId], 
    (CASE 
        WHEN [t8].[test] IS NOT NULL THEN CONVERT(NVarChar(50),[t12].[Name])
        ELSE CONVERT(NVarChar(50),@p14)
     END) AS [QlinkType], 
    (CASE 
        WHEN [t8].[test] IS NOT NULL THEN [t8].[CreatedDate]
        ELSE @p15
     END) AS [QlinkDate], 
    (CASE 
        WHEN [t8].[test] IS NOT NULL THEN 
            (CASE 
                WHEN (CONVERT(NVarChar,[t8].[StatusCode])) <> @p16 THEN @p17
                ELSE CONVERT(NVarChar(7),@p18)
             END)
        ELSE CONVERT(NVarChar(7),@p19)
     END) AS [QlinkStatus]
FROM (
    SELECT [t0].[From], [t0].[EnqueuedTime], [t0].[MessageBody], [t1].[MainMemberIdNumber], [t3].[test], [t3].[ErrorMessage], [t3].[ErrorDate], [t1].[FileIdentifier] AS [value]
    FROM [common].[ServiceBusMessage] AS [t0]
    LEFT OUTER JOIN [Load].[ConsolidatedFuneralMember] AS [t1] ON [t0].[MessageBody] = (CONVERT(NVarChar(MAX),[t1].[FileIdentifier]))
    LEFT OUTER JOIN (
        SELECT 1 AS [test], [t2].[FileIdentifier], [t2].[ErrorMessage], [t2].[ErrorDate]
        FROM [Load].[ConsolidatedFuneralError] AS [t2]
        ) AS [t3] ON (CONVERT(NVarChar(MAX),[t1].[FileIdentifier])) = (CONVERT(NVarChar(MAX),[t3].[FileIdentifier]))
    ) AS [t4]
LEFT OUTER JOIN (
    SELECT 1 AS [test], [t5].[QlinkTransactionId], [t5].[QlinkTransactionTypeId], [t5].[Response], [t5].[StatusCode], [t5].[CreatedDate], [t6].[PolicyNumber], [t6].[CreatedDate] AS [CreatedDate2]
    FROM [client].[QlinkTransaction] AS [t5]
    INNER JOIN [policy].[Policy] AS [t6] ON [t5].[ItemId] = [t6].[PolicyId]
    INNER JOIN [common].[QLinkTransactionType] AS [t7] ON [t5].[QlinkTransactionTypeId] = [t7].[Id]
    ) AS [t8] ON (
    (CASE 
        WHEN DATALENGTH([t4].[MainMemberIdNumber]) = 0 THEN 0
        ELSE CHARINDEX([t4].[MainMemberIdNumber], [t8].[Response]) - 1
     END)) > @p0
LEFT OUTER JOIN (
    SELECT 1 AS [test], [t9].[WizardConfigurationId], [t9].[Name], [t9].[Data], [t9].[CreatedDate], [t9].[ModifiedDate], [t10].[Name] AS [Name2]
    FROM [bpm].[Wizard] AS [t9]
    INNER JOIN [common].[WizardStatus] AS [t10] ON [t9].[WizardStatusId] = [t10].[Id]
    ) AS [t11] ON ((
    (CASE 
        WHEN (CONVERT(Int,DATALENGTH(CONVERT(NVarChar(MAX),[t4].[value])) / 2)) = 0 THEN 0
        ELSE CHARINDEX(CONVERT(NVarChar(MAX),[t4].[value]), [t11].[Data]) - 1
     END)) > @p1) AND ([t11].[WizardConfigurationId] = @p2)
LEFT OUTER JOIN [common].[QLinkTransactionType] AS [t12] ON [t12].[Id] = [t8].[QlinkTransactionTypeId]
WHERE ([t4].[From] LIKE @p3) AND ([t4].[EnqueuedTime] > @p4)
Order by [DateReceived] desc