CREATE PROCEDURE [claim].[GetCompliancePool] 
(
	@PageNumber			AS	INT,
	@RowsOfPage			AS	INT,
	@SortingCol			AS	VARCHAR(100) = 'iSTopEmployer',
	@SortType			AS	VARCHAR(100) = 'Desc',
	@SearchCreatia		AS	VARCHAR(150) = '',
	@ReAllocate		    AS	bit	= 0,
	@UserLoggedIn		AS	int	= 0,
	@WorkPoolId		    AS	int	= 0,
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
	--	DECLARE	@SearchCreatia	AS VARCHAR(150) =	'Unassigned';
	--	DECLARE @ReAllocate		AS	bit	= 1;
	--	DECLARE @UserLoggedIn   AS	INT	= 66;
	--	DECLARE @WorkPoolId		AS	int	= 15;
	--	DECLARE @IsUserBox		AS	int	= 0;
	--	DECLARE @RecordCount	INT			=	0 ;
	--END

	BEGIN
		DECLARE @LiabilityNotAccepted	AS INT = (SELECT Id FROM common.ClaimLiabilityStatus WHERE [name] = 'Liability Not Accepted')
		DECLARE @pendingInvestigations	AS INT = (SELECT claimStatusid FROM CLAIM.ClaimStatus WHERE [name] = 'Pending Investigations');
		DECLARE @autoAcknowledged	AS INT = (SELECT claimStatusid FROM CLAIM.ClaimStatus WHERE [status] = 'Acknowledged');
		DECLARE @manualAcknowledged	AS INT = (SELECT claimStatusid FROM CLAIM.ClaimStatus WHERE [status] = 'Manually-Acknowledged');

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
		SELECT
				CL.ClaimId									AS ClaimId,
				PE.PersonEventId							AS PersonEventId,
				CL.[ClaimReferenceNumber]                   AS ClaimNumber,
				PE.personEventReferenceNumber               AS PersonEventReference,
				E.EventTypeId								AS EventType,				
				PE.AssignedToUserID							AS AssignedTo,				
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
				0											AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				PE.PersonEventBucketClassId					AS BucketClassId,
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
															     		
				FROM        claim.PersonEvent			    AS pe 													       
				INNER JOIN	claim.Claim						AS CL	ON pe.PersonEventId				= cl.PersonEventId
				INNER JOIN	COMMON.POOLWORKFLOW				AS PW	ON CL.CLAIMID				    = PW.ITEMID
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS E	ON pE.EventId					= e.EventId 
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id

				WHERE CL.UNDERWRITERID = 1 
				AND CL.ClaimStatusId in (@autoAcknowledged,  @manualAcknowledged,  @pendingInvestigations)
				AND PE.IsStraightThroughProcess = 0
				AND PE.PersonEventBucketClassId != 1
				AND cl.claimLiabilityStatusId in (@LiabilityNotAccepted)
				AND PW.WORKPOOLID in (@WorkPoolId)
				--AND (PE.SuspiciousTransactionStatusId = 1 OR PE.IsAssault = 1 OR PE.IsHijack = 1)
		END

	IF(@ReAllocate = 1 AND @SearchCreatia = 'Unassigned')
		BEGIN
			INSERT INTO #Pool 
		SELECT
				CL.ClaimId									AS ClaimId,
				PE.PersonEventId							AS PersonEventId,
				CL.[ClaimReferenceNumber]                   AS ClaimNumber,
				PE.personEventReferenceNumber               AS PersonEventReference,
				E.EventTypeId								AS EventType,				
				PE.AssignedToUserID							AS AssignedTo,				
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
				0											AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				PE.PersonEventBucketClassId					AS BucketClassId,
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
															     		
				FROM        claim.PersonEvent			    AS pe 													       
				INNER JOIN	claim.Claim						AS CL	ON pe.PersonEventId				= cl.PersonEventId
				INNER JOIN	COMMON.POOLWORKFLOW				AS PW	ON CL.CLAIMID				    = PW.ITEMID
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS E	ON pE.EventId					= e.EventId 
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id

				WHERE CL.UNDERWRITERID = 1 
				AND CL.ClaimStatusId in (@autoAcknowledged,  @manualAcknowledged,  @pendingInvestigations)
				AND PE.IsStraightThroughProcess = 0
				AND PE.PersonEventBucketClassId != 1
				AND cl.claimLiabilityStatusId in (@LiabilityNotAccepted)
				AND PW.WORKPOOLID in (@WorkPoolId)
				--AND (PE.SuspiciousTransactionStatusId = 1 OR PE.IsAssault = 1 OR PE.IsHijack = 1)
				AND PW.AssignedToUserId is null
		END

	ELSE IF (@ReAllocate = 0 and @IsUserBox = 0)
		BEGIN
			INSERT INTO #Pool 
		SELECT
				CL.ClaimId									AS ClaimId,
				PE.PersonEventId							AS PersonEventId,
				CL.[ClaimReferenceNumber]                   AS ClaimNumber,
				PE.personEventReferenceNumber               AS PersonEventReference,
				E.EventTypeId								AS EventType,				
				PE.AssignedToUserID							AS AssignedTo,				
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
				0											AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				PE.PersonEventBucketClassId					AS BucketClassId,
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
															     		
				FROM        claim.PersonEvent			    AS pe 													       
				INNER JOIN	claim.Claim						AS CL	ON pe.PersonEventId				= cl.PersonEventId
				INNER JOIN	COMMON.POOLWORKFLOW				AS PW	ON CL.CLAIMID				    = PW.ITEMID
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS E	ON pE.EventId					= e.EventId 
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id

				WHERE CL.UNDERWRITERID = 1 
				AND PW.WORKPOOLID in (@WorkPoolId)
				AND cl.claimLiabilityStatusId in (@LiabilityNotAccepted)	
				AND CL.ClaimStatusId in (@autoAcknowledged,  @manualAcknowledged,  @pendingInvestigations)
				AND PW.AssignedToUserId is null
				AND PE.IsStraightThroughProcess = 0
				AND PE.PersonEventBucketClassId != 1
				--AND (PE.SuspiciousTransactionStatusId = 1 OR PE.IsAssault = 1 OR PE.IsHijack = 1)
		END

    ELSE IF (@ReAllocate = 0 and @IsUserBox = 1)
		BEGIN
			INSERT INTO #Pool 
		SELECT
				CL.ClaimId									AS ClaimId,
				PE.PersonEventId							AS PersonEventId,
				CL.[ClaimReferenceNumber]                   AS ClaimNumber,
				PE.personEventReferenceNumber               AS PersonEventReference,
				E.EventTypeId								AS EventType,				
				PE.AssignedToUserID							AS AssignedTo,				
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
				0											AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				PE.PersonEventBucketClassId					AS BucketClassId,
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
															     		
				FROM        claim.PersonEvent			    AS pe 													       
				INNER JOIN	claim.Claim						AS CL	ON pe.PersonEventId				= cl.PersonEventId
				INNER JOIN	COMMON.POOLWORKFLOW				AS PW	ON CL.CLAIMID				    = PW.ITEMID
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS E	ON pE.EventId					= e.EventId 
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id

				WHERE CL.UNDERWRITERID = 1 
				AND PW.WORKPOOLID in (@WorkPoolId)
				AND cl.claimLiabilityStatusId in (@LiabilityNotAccepted)	
				AND CL.ClaimStatusId in (@autoAcknowledged,  @manualAcknowledged,  @pendingInvestigations)
				AND PW.AssignedToUserId = @UserLoggedIn
				AND PE.IsStraightThroughProcess = 0
				AND PE.PersonEventBucketClassId != 1
				--AND (PE.SuspiciousTransactionStatusId = 1 OR PE.IsAssault = 1 OR PE.IsHijack = 1)
		END
	END

	BEGIN --DELETE DUPLICATES
		DELETE FROM #Pool
		WHERE RowNum > 1;
	END

	BEGIN -- CHECK CONDITIONS
		IF(@SearchCreatia IS NOT NULL AND @SearchCreatia != '' AND @SearchCreatia <> 'Unassigned')
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