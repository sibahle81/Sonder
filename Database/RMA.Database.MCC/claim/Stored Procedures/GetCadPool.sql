
CREATE PROCEDURE [claim].[GetCadPool] 
(
	@PageNumber			AS	INT,
	@RowsOfPage			AS	INT,
	@SortingCol			AS	VARCHAR(100) = 'iSTopEmployer',
	@SortType			AS	VARCHAR(100) = 'DESC',
	@SearchCreatia		AS	VARCHAR(150) = '',
	@ReAllocate		    AS	bit	= 0,
	@UserLoggedIn		AS	int	= 0,
	@WorkpoolId		    AS	int	= 0,
	@IsUserBox		    AS	int	= 0,
	@RecordCount		INT = 0 OUTPUT
)
AS 

BEGIN
	--BEGIN --DEBUGGING
	--	DECLARE	@PageNumber		AS INT			=	1;
	--	DECLARE	@RowsOfPage		AS INT			=	500;
	--	DECLARE	@SortingCol		AS VARCHAR(100) =	'iSTopEmployer';
	--	DECLARE	@SortType		AS VARCHAR(100) =	'Desc';
	--	DECLARE	@SearchCreatia	AS VARCHAR(150) =	'X/23031352/1/AP011549/23/???';
	--	DECLARE @ReAllocate		AS	bit	= 1;
	--	DECLARE @UserLoggedIn   AS	INT	= 103;
	--	DECLARE @WorkPoolId		AS	int	= 11;
	--	DECLARE @IsUserBox		AS	int	= 0;
	--	DECLARE @RecordCount	INT			=	0 ;
	--END

	BEGIN
		DECLARE	@ClaimBucketClassId INT = (SELECT ClaimBucketClassId FROM claim.ClaimBucketClass WHERE	[name] = 'Fatals');
		DECLARE @manualAcknowledged	AS INT = (SELECT claimStatusid FROM CLAIM.ClaimStatus WHERE [status] = 'Manually-Acknowledged');
		DECLARE @autoAcknowledged	AS INT = (SELECT claimStatusid FROM CLAIM.ClaimStatus WHERE [status] = 'Acknowledged');
		DECLARE @underInvestigation	AS INT = (SELECT claimStatusid FROM CLAIM.ClaimStatus WHERE [name] = 'Pending Investigations');
		DECLARE @pendingAcknowledgement	AS INT = (SELECT claimStatusid FROM CLAIM.ClaimStatus WHERE [name] = 'Pending Acknowledgement');
		DECLARE @pendingRequirements AS INT = (SELECT TOP 1 claimStatusid FROM CLAIM.ClaimStatus WHERE [name] = 'Pending Requirements');

	END --CREATING VARIABLES

	BEGIN --CREATING TEMP TABLE 
		CREATE TABLE #Pool  
			(
			    ClaimId					INT,
				PersonEventId			INT,
				ClaimNumber				VARCHAR(250),
				PersonEventReference    VARCHAR(250),
				EventType				INT,
				AssignedTo				INT,
				ClaimStatus				INT,
				LiabilityStatus			INT,
				DiseaseDescription		VARCHAR(250),
				DateCreated				DATETIME,
				[Priority]				VARCHAR(250),			
				InsuredLife				VARCHAR(250),
				IdentificationNumber	VARCHAR(250),
				PersonEventCreatedBy	VARCHAR(250),
				LastModifiedBy			VARCHAR(250),
				InjuryType				INT,
				EmployeeNumber			VARCHAR(250),
				EmployeeIndustryNumber	VARCHAR(250),
				LastWorkedOnUserId		INT,
				iSTopEmployer			BIT,
				Included                BIT,
				CompanyName				VARCHAR(250),
				CompanyReferenceNumber	VARCHAR(250),
				BucketClassId			INT,
				InvestigationRequired   BIT,
				UserName				VARCHAR(250),				
				UserId					INT,
				STPExitReason			INT,				
				[Application]			VARCHAR(250),
				[RowNum]				INT,
			);
	END
	
	BEGIN --GETTING DATA
	IF(@ReAllocate = 1 AND @SearchCreatia != 'Unassigned')
		BEGIN
			INSERT INTO #Pool 
		SELECT DISTINCT
				CL.ClaimId									AS ClaimId,
				PE.PersonEventId							AS PersonEventId,
				CL.[ClaimReferenceNumber]                   AS ClaimNumber,
				PE.personEventReferenceNumber               AS PersonEventReference,
				E.EventTypeId								AS EventType,				
				PW.AssignedToUserID							AS AssignedTo,				
				CL.ClaimStatusId							AS ClaimStatus,				
				CL.ClaimLiabilityStatusId					AS LiabilityStatus,			
				EC.[Description]							AS DiseaseDescription,		
				PE.CreatedDate								AS CreatedDate,				
				'P1'									    AS [Priority],													
				p.FirstName + ' ' + p.Surname				AS InsuredLifE,	
				P.IdNumber									AS IdentificationNumber,			
				PE.CreatedBy								AS PersonEventCreatedBy,
				''											AS LastModifiedBy,			
				1											AS InjuryType,
				''									        AS EmployeeNumber,	
				''								            AS EmployeeIndustryNumber,
				0										    AS LastWorkedOnUserId,
				C.IsTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				PE.PersonEventBucketClassId					AS BucketClassId,
				cl.investigationRequired					AS InvestigationRequired,
				us.DisplayName								AS UserName,	
				us.id										AS UserId,			
							
				(SELECT TOP 1 STPExitReasonID 							  	
					FROM  CLAIM.PersonEventSTPExitReasons	
					WHERE PersonEventId = pe.PersonEventId 
					ORDER BY ClaimSTPExitReasonID DESC)		AS STPExitReason,			
								
				(CASE
					WHEN pe.[CompCarePersonEventId] 
					IS NOT NULL 
					THEN 'Compcare' 
					ELSE 'Modernization' 
				END)									    AS [Application],

				RANK() OVER (PARTITION BY CL.ClaimId ORDER BY PW.ModifiedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	claim.Claim						AS CL	ON PW.ITEMID				    = CL.CLAIMID  
				INNER JOIN  claim.PersonEvent			    AS pe 	ON PE.PERSONEVENTID				= CL.PERSONEVENTID								       
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS E	ON pE.EventId					= e.EventId 
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id

				WHERE pe.isfatal != 1
				AND CL.UNDERWRITERID = 1 	
				AND PW.WORKPOOLID = @WorkPoolId
				AND PE.IsStraightThroughProcess = 0 
				AND (CL.ClaimStatusId not in  (@autoAcknowledged, @manualAcknowledged, @underInvestigation, @pendingAcknowledgement, @pendingRequirements))
				AND	CL.ClaimStatusId not in (6,41,46)
				AND PW.isDeleted = 0
				
		END

	IF(@ReAllocate = 1 AND @SearchCreatia = 'Unassigned')
		BEGIN
			INSERT INTO #Pool 
		SELECT DISTINCT
				CL.ClaimId									AS ClaimId,
				PE.PersonEventId							AS PersonEventId,
				CL.[ClaimReferenceNumber]                   AS ClaimNumber,
				PE.personEventReferenceNumber               AS PersonEventReference,
				E.EventTypeId								AS EventType,				
				PW.AssignedToUserID							AS AssignedTo,				
				CL.ClaimStatusId							AS ClaimStatus,				
				CL.ClaimLiabilityStatusId					AS LiabilityStatus,			
				EC.[Description]							AS DiseaseDescription,		
				PE.CreatedDate								AS CreatedDate,				
				'P1'									    AS [Priority],													
				p.FirstName + ' ' + p.Surname				AS InsuredLifE,	
				P.IdNumber									AS IdentificationNumber,			
				PE.CreatedBy								AS PersonEventCreatedBy,
				''											AS LastModifiedBy,			
				1											AS InjuryType,
				''									        AS EmployeeNumber,	
				''								            AS EmployeeIndustryNumber,
				0										    AS LastWorkedOnUserId,
				C.IsTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				PE.PersonEventBucketClassId					AS BucketClassId,
				cl.investigationRequired					AS InvestigationRequired,
				us.DisplayName								AS UserName,	
				us.id										AS UserId,			
							
				(SELECT TOP 1 STPExitReasonID 							  	
					FROM  CLAIM.PersonEventSTPExitReasons	
					WHERE PersonEventId = pe.PersonEventId 
					ORDER BY ClaimSTPExitReasonID DESC)		AS STPExitReason,			
								
				(CASE
					WHEN pe.[CompCarePersonEventId] 
					IS NOT NULL 
					THEN 'Compcare' 
					ELSE 'Modernization' 
				END)									    AS [Application],

				RANK() OVER (PARTITION BY CL.ClaimId ORDER BY PW.ModifiedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	claim.Claim						AS CL	ON PW.ITEMID				    = CL.CLAIMID  
				INNER JOIN  claim.PersonEvent			    AS pe 	ON PE.PERSONEVENTID				= CL.PERSONEVENTID								       
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS E	ON pE.EventId					= e.EventId 
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id

				WHERE pe.isfatal != 1
				AND CL.UNDERWRITERID = 1 	
				AND PW.WORKPOOLID = @WorkPoolId
				AND PE.IsStraightThroughProcess = 0 
				AND (CL.ClaimStatusId not in  (@autoAcknowledged, @manualAcknowledged, @underInvestigation, @pendingAcknowledgement, @pendingRequirements))
				AND	CL.ClaimStatusId not in (6,41,46)
				AND PW.AssignedToUserId is null 
				AND PW.isDeleted = 0
				AND PW.WorkPoolId = 11
		END

	ELSE IF (@ReAllocate = 0 and @IsUserBox = 0)
		BEGIN
			INSERT INTO #Pool 
		SELECT DISTINCT
				CL.ClaimId									AS ClaimId,
				PE.PersonEventId							AS PersonEventId,
				CL.[ClaimReferenceNumber]                   AS ClaimNumber,
				PE.personEventReferenceNumber               AS PersonEventReference,
				E.EventTypeId								AS EventType,				
				PW.AssignedToUserID							AS AssignedTo,				
				CL.ClaimStatusId							AS ClaimStatus,				
				CL.ClaimLiabilityStatusId					AS LiabilityStatus,			
				EC.[Description]							AS DiseaseDescription,		
				PE.CreatedDate								AS CreatedDate,				
				'P1'									    AS [Priority],													
				p.FirstName + ' ' + p.Surname				AS InsuredLifE,	
				P.IdNumber									AS IdentificationNumber,			
				PE.CreatedBy								AS PersonEventCreatedBy,
				''											AS LastModifiedBy,			
				1											AS InjuryType,
				''									        AS EmployeeNumber,	
				''								            AS EmployeeIndustryNumber,
				0										    AS LastWorkedOnUserId,
				C.IsTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				PE.PersonEventBucketClassId					AS BucketClassId,
				cl.investigationRequired					AS InvestigationRequired,
				us.DisplayName								AS UserName,	
				us.id										AS UserId,
							
				(SELECT TOP 1 STPExitReasonID 							  	
					FROM  CLAIM.PersonEventSTPExitReasons	
					WHERE PersonEventId = pe.PersonEventId 
					ORDER BY ClaimSTPExitReasonID DESC)		AS STPExitReason,			
								
				(CASE
					WHEN pe.[CompCarePersonEventId] 
					IS NOT NULL 
					THEN 'Compcare' 
					ELSE 'Modernization' 
				END)									    AS [Application],	
				
				RANK() OVER (PARTITION BY CL.ClaimId ORDER BY PW.ModifiedDate DESC) AS RowNum											
															     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	claim.Claim						AS CL	ON PW.ITEMID				    = CL.CLAIMID  
				INNER JOIN  claim.PersonEvent			    AS pe 	ON PE.PERSONEVENTID				= CL.PERSONEVENTID								       
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS E	ON pE.EventId					= e.EventId 
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID	
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id
				
				WHERE pe.isfatal != 1
				AND CL.UNDERWRITERID = 1 	
				AND PW.WORKPOOLID = @WorkPoolId	
				AND PE.IsStraightThroughProcess = 0 
				AND (CL.ClaimStatusId not in  (@autoAcknowledged, @manualAcknowledged, @underInvestigation, @pendingAcknowledgement, @pendingRequirements))
				AND PW.AssignedToUserId is null 	
				AND	CL.ClaimStatusId not in (6,41,46)
				AND PW.isDeleted = 0
		END

    ELSE IF (@ReAllocate = 0 and @IsUserBox = 1)
		BEGIN
			INSERT INTO #Pool 
		SELECT DISTINCT
				CL.ClaimId									AS ClaimId,
				PE.PersonEventId							AS PersonEventId,
				CL.[ClaimReferenceNumber]                   AS ClaimNumber,
				PE.personEventReferenceNumber               AS PersonEventReference,
				E.EventTypeId								AS EventType,				
				PW.AssignedToUserID							AS AssignedTo,				
				CL.ClaimStatusId							AS ClaimStatus,				
				CL.ClaimLiabilityStatusId					AS LiabilityStatus,			
				EC.[Description]							AS DiseaseDescription,		
				PE.CreatedDate								AS CreatedDate,				
				'P1'									    AS [Priority],													
				p.FirstName + ' ' + p.Surname				AS InsuredLifE,	
				P.IdNumber									AS IdentificationNumber,			
				PE.CreatedBy								AS PersonEventCreatedBy,
				''											AS LastModifiedBy,			
				1											AS InjuryType,
				''									        AS EmployeeNumber,	
				''								            AS EmployeeIndustryNumber,
				0										    AS LastWorkedOnUserId,
				C.IsTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				PE.PersonEventBucketClassId					AS BucketClassId,
				cl.investigationRequired					AS InvestigationRequired,
				us.DisplayName								AS UserName,	
				us.id										AS UserId,
							
				(SELECT TOP 1 STPExitReasonID 							  	
					FROM  CLAIM.PersonEventSTPExitReasons	
					WHERE PersonEventId = pe.PersonEventId 
					ORDER BY ClaimSTPExitReasonID DESC)		AS STPExitReason,			
								
				(CASE
					WHEN pe.[CompCarePersonEventId] 
					IS NOT NULL 
					THEN 'Compcare' 
					ELSE 'Modernization' 
				END)									    AS [Application],	
				
				RANK() OVER (PARTITION BY CL.ClaimId ORDER BY PW.ModifiedDate DESC) AS RowNum											
															     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	claim.Claim						AS CL	ON PW.ITEMID				    = CL.CLAIMID  
				INNER JOIN  claim.PersonEvent			    AS pe 	ON PE.PERSONEVENTID				= CL.PERSONEVENTID								       
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS E	ON pE.EventId					= e.EventId 
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID	
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id
				
				WHERE pe.isfatal != 1
				AND CL.UNDERWRITERID = 1 	
				AND PW.WORKPOOLID = @WorkPoolId	
				AND PE.IsStraightThroughProcess = 0 
				AND (CL.ClaimStatusId not in  (@autoAcknowledged, @manualAcknowledged, @underInvestigation, @pendingAcknowledgement, @pendingRequirements))
				AND PW.AssignedToUserId = @UserLoggedIn
				AND	CL.ClaimStatusId not in (6,41,46)
				AND PW.isDeleted = 0
		END
	END

	BEGIN --DELETE DUPLICATES
		DELETE FROM #Pool
		WHERE RowNum > 1;
	END

	BEGIN -- CHECK CONDITIONS
		IF(@SearchCreatia IS NOT NULL AND @SearchCreatia != '' AND @SearchCreatia <> 'Unassigned' AND @SearchCreatia NOT LIKE '%???' AND @SearchCreatia NOT LIKE '%EMP')
			BEGIN
				update #Pool set included = 0;
				update #Pool set included = 1
				where PersonEventReference      LIKE '%' + @SearchCreatia + '%'
					OR  (AssignedTo				LIKE '%' + @SearchCreatia + '%')
					OR	(InsuredLife			LIKE '%' + @SearchCreatia + '%') 						
					OR	(IdentificationNumber	LIKE '%' + @SearchCreatia + '%')
					OR	(UserId          		LIKE '%' + @SearchCreatia + '%')
					OR	(ClaimNumber			LIKE '%' + @SearchCreatia + '%')

			END
		ELSE IF(@SearchCreatia IS NOT NULL AND @SearchCreatia != '' AND @SearchCreatia <> 'Unassigned')
			BEGIN
				update #Pool set included = 0;
				update #Pool set included = 1
				where PersonEventReference      LIKE '%' + @SearchCreatia + '%'
					OR	(InsuredLife			LIKE '%' + @SearchCreatia + '%') 						
					OR	(IdentificationNumber	LIKE '%' + @SearchCreatia + '%')
					OR	(ClaimNumber			LIKE '%' + @SearchCreatia + '%')
					OR	(DiseaseDescription		LIKE '%' + @SearchCreatia + '%')
					OR	(UserId          		LIKE '%' + @SearchCreatia + '%')
			END
		
	END

	BEGIN --GET RECORD COUNT
	DELETE FROM #Pool WHERE included = 0;
		SELECT @RecordCount = Count(*) from #Pool
	END

BEGIN --SORT BY CRITERIA
    DECLARE @SqlQuery AS NVARCHAR(MAX);
		IF (@SortType = 'asc')
		BEGIN
			SET @SqlQuery = N'SELECT * FROM #Pool 
				ORDER BY ' + QUOTENAME(@SortingCol) + N' ASC, DateCreated 
				OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY'
		END
		ELSE IF (@SortType = 'DESC')
		BEGIN
			SET @SqlQuery = N'SELECT * FROM #Pool 
				ORDER BY ' + QUOTENAME(@SortingCol) + N' DESC, DateCreated  
				OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY'
		END

		EXEC sp_executesql @SqlQuery, N'@PageNumber INT, @RowsOfPage INT', @PageNumber, @RowsOfPage;
	END

	BEGIN -- CLEAN UP
		IF OBJECT_ID('tempdb..#Pool') IS NOT NULL DROP TABLE #Pool;
	END
END