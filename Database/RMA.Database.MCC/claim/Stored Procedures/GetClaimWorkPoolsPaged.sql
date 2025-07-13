CREATE PROCEDURE [claim].[GetClaimWorkPoolsPaged]
	@WorkPoolId INT = 1,
	@UserId INT = NULL,
	@SelectedUserId INT = 0,
    @Query NVARCHAR(250) = '',
	@Page INT = 1,
    @PageSize INT = 10,
    @OrderBy NVARCHAR(100) ='WizardId',
    @isAscending BIT  = 0,
	@RowCount INT = 0 OUTPUT
	WITH RECOMPILE
AS

 BEGIN


	DECLARE @OFFSET INT;
	
	IF(@Page < 1)
	BEGIN
		SET @Page = 1;
	END

	SET @OFFSET = (@Page-1)*@PageSize;

	DECLARE @SelectQuery NVARCHAR(MAX) =
	N'SELECT 
		[C].[ClaimId] [ClaimId],
		[PE].[PersonEventId] [PersonEventId],
		[PE].[PersonEventReferenceNumber] [PersonEventReference],
		ISNULL([C].[ClaimReferenceNumber],[PE].[PersonEventId]) [ClaimUniqueReference],
		[C].[ClaimStatusId] [ClaimStatusId],
		[PIL].[PolicyId] [PolicyId],
		[C].[AssignedToUserId] [AssignedToUserId],
		ISNULL([PIL].[CoverAmount],[BR].[BenefitAmount]) [TotalBenefitAmount],
		CASE WHEN [C].[ClaimId] IS NULL THEN
				[PEU].[Id]
			ELSE 
				[CU].[Id]
			END	[UserId],
		[W].[LockedToUser] [UserEmail],
		[E].[CreatedBy] [EventCreatedBy],
		[EU].[Id] [EventCreatedById],
		[W].[StartDateAndTime] [StartDateAndTime],
		ISNULL([W].[EndDateAndTime], GETDATE()) [EndDateAndTime],
		CASE WHEN [C].[ClaimId] IS NULL THEN
				[PEU].[DisplayName]
			ELSE 
				[CU].[DisplayName]
			END	[UserName],
		CASE WHEN [C].[ClaimId] IS NULL THEN
				[PE].[AssignedToUserId]
			ELSE 
				[C].[AssignedToUserId]
			END [PersonEventAssignedTo],
		[RP].[DisplayName] [LifeAssured],
		[PE].[CreatedDate] [DateCreated],
		CAST(DATEADD(SECOND, 0, ''1900-01-01'') AS TIME) [UserSLA],
		CAST(DATEADD(SECOND, 360, ''1900-01-01'') AS TIME) [OverAllSLA],
		CASE WHEN [C].[ClaimId] IS NULL 
			 THEN 
				 CASE WHEN [PES].Id IN (0,1,3) 
				 THEN ''New''	 
				 ELSE [PES].[Name] 
				 END
			 ELSE [CS].[Name] END [ClaimStatus],
		0 [NUserSLA],
		bpm.CalculateOverAllSLA([W].[StartDateAndTime],
		CASE WHEN [C].[ClaimId] IS NULL THEN 
			CASE WHEN [PE].[PersonEventStatusId] in (2,3,4) 
				THEN [PE].[ModifiedDate]
				ELSE GETDATE()
		END	
		WHEN [C].[ClaimStatusId] in (6,7,9,10,14,19,40,41) 
			THEN [C].[ModifiedDate]
		ELSE GETDATE() 	
		END,[WC].[SLAWarning],[WC].[SLAEscalation]) [NOverAllSLA],
		[CWU].[DisplayName] [LastWorkedOn], 
		bpm.CalculateOverAllSLATimeElapsed(
		 CASE WHEN [C].[ClaimId] IS NULL THEN [PE].[ModifiedDate]
			  ELSE [C].[ModifiedDate]
		 END
		 ,
		 CASE WHEN [C].[ClaimId] IS NULL THEN 
				CASE WHEN [PE].[PersonEventStatusId] in (2,3,4) THEN [PE].[ModifiedDate]
					 ELSE GETDATE()
				END	
			WHEN  [C].[ClaimStatusId] in (6,7,9,10,14,19,40,41) 
				THEN [C].[ModifiedDate]
			ELSE GETDATE() 	
		 END) [UserSLAHours],

		bpm.CalculateOverAllSLATimeElapsed([W].[StartDateAndTime],
		CASE WHEN [C].[ClaimId] IS NULL THEN 
			CASE WHEN [PE].[PersonEventStatusId] in (2,3,4) 
				THEN [PE].[ModifiedDate]
				ELSE GETDATE()
		END	
		WHEN [C].[ClaimStatusId] in (6,7,9,10,14,19,40,41) 
			THEN [C].[ModifiedDate]
		ELSE GETDATE() 	
		END) [OverAllSLAHours],
		0 [WizardUserId],
		''/claimcare/claim-manager/register-funeral-claim/continue/''+ CAST([W].[Id] AS NVARCHAR(50)) [WizardURL],
		[P].[PolicyNumber] [PolicyNumber],
		[P].[PolicyStatusId] [PolicyStatusId],
		0 [PolicyBrokerId],
		CASE WHEN [C].[ClaimId] IS NULL 
			THEN CASE WHEN [PES].Id IN (0,1) 
				 THEN ''New'' 	 
				 ELSE [PES].[Name] 
				 END
			ELSE CASE WHEN [C].[ClaimStatusId] = 10 THEN [CDR].[Name]
					  WHEN [C].[ClaimStatusId] = 7 THEN [CCLR].[Name]
					  WHEN [C].[ClaimStatusId] = 41 THEN [CCR].[Name]
					  ELSE [CS].[Reason] END
			END [ClaimStatusDisplayName],
		CASE WHEN [C].[ClaimId] IS NULL 
			THEN CASE WHEN [PES].Id IN (0,1) 
				 THEN ''New'' 	 
				 ELSE [PES].[Name] 
				 END
			ELSE [CS].[Status] END [ClaimStatusDisplayDescription],
		[CWU].[Id] [LastWorkedOnUserId],
		[PE].[InsuredLifeId] [InsuredLifeId],
		[W].[Id] [WizardId],
		[W].[WizardConfigurationId] [WizardConfigurationId],
		[W].[WizardStatusId] [WizardStatusId],
		[W].[Name] [Name],
		[W].[Data] [Data],
		'+CONVERT(NVARCHAR, @WorkPoolId)+' [WorkPoolId],
		[W].[CurrentStepIndex] [CurrentStepIndex] 
		'

		DECLARE @FromQuery NVARCHAR(MAX) =
		'FROM [claim].[PersonEvent](NOLOCK) [PE] 
		INNER JOIN [common].[PersonEventStatus](NOLOCK) [PES] ON [PE].[PersonEventStatusId] = [PES].[Id]
		INNER JOIN [claim].[Event](NOLOCK) [E] ON [PE].[EventId] = [E].[EventId]
		INNER JOIN [client].[Roleplayer](NOLOCK) [RP] ON [PE].[InsuredLifeId] = [RP].[RoleplayerId]
		INNER JOIN [client].[Person](NOLOCK) [PRS] ON [RP].[RoleplayerId] = [PRS].[RoleplayerId]
		INNER JOIN [bpm].[Wizard] (NOLOCK) [W] ON [PE].[EventId] = [W].[LinkedItemId] AND [W].[WizardConfigurationId] in (14)
		INNER JOIN [bpm].[WizardConfiguration](NOLOCK) [WC] ON [W].[WizardConfigurationId] = [WC].[Id]
		INNER JOIN [security].[User](NOLOCK) [EU] ON [E].[CreatedBy] = [EU].[Email]
		LEFT JOIN [claim].[Claim](NOLOCK) [C] ON [PE].[PersonEventId] = [C].[PersonEventId] 
		LEFT JOIN [policy].[PolicyInsuredLives](NOLOCK) [PIL] ON [PE].[InsuredLifeId] = [PIL].[RolePlayerId] AND [PIL].[PolicyId] = [C].[PolicyId]
		LEFT JOIN [policy].[Policy](NOLOCK) [P] ON [PIL].[PolicyId] = [P].[PolicyId]
		LEFT JOIN [common].[PolicyStatus](NOLOCK) [PS] on [P].[PolicyStatusId] = [PS].[Id]
		LEFT JOIN [claim].[ClaimStatus](NOLOCK) [CS] ON [C].[ClaimStatusId] = [CS].[ClaimStatusId]
		LEFT JOIN [security].[User](NOLOCK) [PEU] ON [PEU].[Id] = [PE].[AssignedToUserId]
		LEFT JOIN [security].[User](NOLOCK) [CU] ON [CU].[Id] = [C].[AssignedToUserId]
		LEFT JOIN [common].[ClaimDeclineReason](NOLOCK) [CDR] ON [C].[ClaimDeclineReasonId] = [CDR].[Id]
		LEFT JOIN [common].[ClaimCancellationReason](NOLOCK)[CCLR] ON [C].[ClaimCancellationReasonId] = [CCLR].[Id]
		LEFT JOIN [common].[ClaimClosedReason](NOLOCK)[CCR] ON [C].[ClaimClosedReasonId] = [CCR].[Id]

		LEFT JOIN [product].[BenefitRate] (NOLOCK) BR ON BR.Id = 
			 (SELECT TOP 1 Id FROM [product].[BenefitRate]  (NOLOCK)
						WHERE  (BenefitId = PIL.StatedBenefitId)
						ORDER BY EffectiveDate DESC) 
		LEFT JOIN [security].[User](NOLOCK) [U] ON [U].[Id] = ' + CONVERT (NVARCHAR, @UserId)+ '
		OUTER APPLY 
			(
			SELECT TOP 1 * FROM [security].[User](NOLOCK) [WU]
						WHERE  [WU].[Id] = CASE WHEN [C].[ClaimId] IS NULL 
								THEN (SELECT TOP 1 [AssignedToUserId] FROM [claim].[ClaimWorkflow](NOLOCK) WHERE [PersonEventId] = [PE].[PersonEventId] AND [EndDateTime] IS NOT NULL AND [AssignedToUserId] IS NOT NULL ORDER BY [ClaimWorkFlowId] DESC)					
								ELSE (SELECT TOP 1 [AssignedToUserId] FROM [claim].[ClaimWorkflow](NOLOCK) WHERE [ClaimId] = [C].[ClaimId] AND [EndDateTime] IS NOT NULL AND [AssignedToUserId] IS NOT NULL ORDER BY [ClaimWorkFlowId] DESC)				
						END
			) [CWU] '
		
		DECLARE @WhereQuery NVARCHAR(MAX) =
		N'WHERE 
		1 = CASE WHEN '+ CONVERT(NVARCHAR, @SelectedUserId) +' <> 0 THEN 
					 CASE WHEN [C].[AssignedToUserId] = '+ CONVERT(NVARCHAR, @SelectedUserId) +' THEN 1 --Assigned to selected user	 	   
					      ELSE 0
					 END
				ELSE 1
			END	
		AND
		3 = CASE WHEN '+ CONVERT(NVARCHAR, @WorkPoolId) +' = 3 THEN	--Second Approver pool
					CASE WHEN [C].[ClaimStatusId] = 13 THEN 3 -- Approved			   
						 ELSE 0
						 END
					ELSE 3
				END
		AND
		4 = CASE WHEN '+ CONVERT(NVARCHAR, @WorkPoolId) +' = 4 THEN	--Investigation pool
					CASE WHEN [C].[ClaimStatusId] in (4,21) THEN 4	--	Awaiting Decision,Return To Assessor	   
						 ELSE 0
						 END
					ELSE 4
				END
		AND
		5 = CASE WHEN '+ CONVERT(NVARCHAR, @WorkPoolId) +' = 5 THEN	--Finance pool
					CASE WHEN [C].[ClaimStatusId] in (9,14,23) THEN 5 --Paid,Authorised,Unpaid		   
						 ELSE 0
						 END
					ELSE 5
				END
		AND
		6 = CASE WHEN '+ CONVERT(NVARCHAR, @WorkPoolId) +' = 6 THEN	--Decline pool
					CASE WHEN [PE].[PersonEventStatusId] = 4 OR [C].[ClaimStatusId] in (7,10,26) THEN 6 -- Cancelled,Declined,Awaiting Decline Decision			   
						 ELSE 0
						 END
					ELSE 6
				END
		AND
		7 = CASE WHEN '+ CONVERT(NVARCHAR, @WorkPoolId) +' = 7 THEN	--Policy Manager pool
					CASE WHEN [C].[ClaimStatusId] = 5 THEN 7 -- Pending Policy Admin  			   
						 ELSE 0
						 END
					ELSE 7
				END
			
 '
	DECLARE @SearchQuery NVARCHAR(MAX) =  CASE WHEN @Query IS NOT NULL AND @Query <> '' THEN
				N' AND
					(
						[PE].[PersonEventId] LIKE ''%' + @Query + '%'' 
						OR
						[P].[PolicyNumber] LIKE ''%' + @Query + '%'' 
						OR
						[C].[ClaimReferenceNumber] LIKE ''%' + @Query + '%'' 
						OR
						[RP].[DisplayName] LIKE ''%' + @Query + '%'' 
						OR
						[PRS].[IdNumber] LIKE ''%' + @Query + '%'' 
					) ' ELSE '' END;

		DECLARE @OrderByQuery NVARCHAR(MAX) =
		N' ORDER BY ' + @OrderBy + CASE WHEN @isAscending = 1 THEN ' ASC ' ELSE ' DESC ' END +
									' OFFSET '+ CONVERT (NVARCHAR, @OFFSET) + ' ROWS FETCH NEXT ' + CONVERT (NVARCHAR, @PageSize)+ ' ROWS ONLY'

 	   DECLARE @QueryResults NVARCHAR(MAX) = @SelectQuery + @FromQuery + @WhereQuery + @SearchQuery + @OrderByQuery

	   DECLARE @RowCountQueryResults NVARCHAR(MAX) = N'SELECT @RowCount = COUNT(0) ' + @FromQuery + @WhereQuery + @SearchQuery
	   
	   	DECLARE @ParamDefinition AS NVARCHAR(50)	
		SET @ParamDefinition = N'@RowCount INT OUTPUT'

		EXEC SP_EXECUTESQL @RowCountQueryResults , @ParamDefinition, @RowCount OUTPUT	
	
       EXEC(@QueryResults)
END
