
CREATE PROCEDURE [claim].[GetEarningsPool] 
(
	@PageNumber			AS	INT,
	@RowsOfPage			AS	INT,
	@SortingCol			AS	VARCHAR(100) = 'IsFatal',
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
	--	DECLARE	@SortingCol		AS VARCHAR(100) =	'IsFatal';
	--	DECLARE	@SortType		AS VARCHAR(100) =	'DESC';
	--	DECLARE	@SearchCreatia	AS VARCHAR(150) =	'';
	--	DECLARE @ReAllocate		AS	bit	= 1;
	--	DECLARE @UserLoggedIn   AS	INT	= 1197;
	--	DECLARE @WorkPoolId		AS	int	= 14;
	--	DECLARE @IsUserBox		AS	int	= 0;
	--	DECLARE @RecordCount	INT			=	0 ;
	--END

	BEGIN --CREATING VARIABLES
		DECLARE @InsuranceTypeAccident 	INT = (SELECT ParentInsuranceTypeID  FROM claim.ParentInsuranceType WHERE ([Code] = 'IOD COID' OR [Code] = 'IOD' )  AND IsActive = 1 AND IsDeleted = 0)	--Injury On Duty COID
		DECLARE @InsuranceTypeDisease	INT = (SELECT ParentInsuranceTypeID  FROM claim.ParentInsuranceType	WHERE    Code  = 'COIDA O/D'	AND IsActive = 1 AND IsDeleted = 0)	--COIDA Occupational Disease
	END 

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
				IsFatal					INT,
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
				C.iSTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				pe.PersonEventBucketClassId					AS BucketClassId,
				cl.investigationRequired					AS InvestigationRequired,
			    us.DisplayName								AS UserName,	
				us.id										AS UserId,
				IsFatal										AS IsFatal,
							
				(SELECT TOP 1 STPExitReasonID 							  	
					FROM  CLAIM.PersonEventSTPExitReasons	
					WHERE PersonEventId = pe.PersonEventId 
					ORDER BY ClaimSTPExitReasonID DESC)		AS STPExitReason,
															
				(CASE
					WHEN pe.[CompCarePersonEventId] 
					IS NOT NULL 
					THEN 'Compcare' 
					ELSE 'Modernization' 
				END)										AS [Application],
												    
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
				AND  cl.ClaimStatusId not in  (6, 41)
				AND  PE.IsStraightThroughProcess = 0 
				AND	((pe.InsuranceTypeId = @InsuranceTypeAccident) or (pe.InsuranceTypeId = @InsuranceTypeDisease))
				AND (pe.IsDeleted	= 0)
				AND PW.WORKPOOLID = @WorkPoolId
				AND PW.isDeleted = 0
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
			C.iSTopEmployer								AS iSTopEmployer,
			1											AS Included,							
			c.[Name]									AS CompanyName,
			c.ReferenceNumber							AS CompanyReferenceNumber,
			pe.PersonEventBucketClassId					AS BucketClassId,
			cl.investigationRequired					AS InvestigationRequired,
			us.DisplayName								AS UserName,	
			us.id										AS UserId,
			IsFatal										AS IsFatal,
							
			(SELECT TOP 1 STPExitReasonID 							  	
				FROM  CLAIM.PersonEventSTPExitReasons	
				WHERE PersonEventId = pe.PersonEventId 
				ORDER BY ClaimSTPExitReasonID DESC)		AS STPExitReason,
															
			(CASE
				WHEN pe.[CompCarePersonEventId] 
				IS NOT NULL 
				THEN 'Compcare' 
				ELSE 'Modernization' 
			END)										AS [Application],
												    
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
			AND  cl.ClaimStatusId not in  (6, 41)
			AND  PE.IsStraightThroughProcess = 0 
			AND	((pe.InsuranceTypeId = @InsuranceTypeAccident) or (pe.InsuranceTypeId = @InsuranceTypeDisease))
			AND (pe.IsDeleted	= 0)
			AND PW.WORKPOOLID = @WorkPoolId
			AND PW.AssignedToUserId is null
			AND PW.isDeleted = 0
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
				C.iSTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				pe.PersonEventBucketClassId					AS BucketClassId,			
				cl.investigationRequired					AS InvestigationRequired,
			    us.DisplayName								AS UserName,	
				us.id										AS UserId,
				IsFatal										AS IsFatal,			
				(SELECT TOP 1 STPExitReasonID 							  	
					FROM  CLAIM.PersonEventSTPExitReasons	
					WHERE PersonEventId = pe.PersonEventId 
					ORDER BY ClaimSTPExitReasonID DESC)		AS STPExitReason,
															
				(CASE
					WHEN pe.[CompCarePersonEventId] 
					IS NOT NULL 
					THEN 'Compcare' 
					ELSE 'Modernization' 
				END)										AS [Application],
												    
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
				AND  cl.ClaimStatusId not in  (6, 41)
				AND PW.WORKPOOLID = @WorkPoolId	
				AND PW.AssignedToUserId is null
				AND  PE.IsStraightThroughProcess = 0 
				AND	((pe.InsuranceTypeId = @InsuranceTypeAccident) or (pe.InsuranceTypeId = @InsuranceTypeDisease))
				AND (pe.IsDeleted	= 0)	
				AND PW.isDeleted = 0
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
				C.iSTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				pe.PersonEventBucketClassId					AS BucketClassId,			
				cl.investigationRequired					AS InvestigationRequired,
			    us.DisplayName								AS UserName,	
				us.id										AS UserId,
				IsFatal										AS IsFatal,			
				(SELECT TOP 1 STPExitReasonID 							  	
					FROM  CLAIM.PersonEventSTPExitReasons	
					WHERE PersonEventId = pe.PersonEventId 
					ORDER BY ClaimSTPExitReasonID DESC)		AS STPExitReason,
															
				(CASE
					WHEN pe.[CompCarePersonEventId] 
					IS NOT NULL 
					THEN 'Compcare' 
					ELSE 'Modernization' 
				END)										AS [Application],
												    
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
				AND  cl.ClaimStatusId not in  (6, 41)
				AND PW.WORKPOOLID = @WorkPoolId	
				AND PW.AssignedToUserId = @UserLoggedIn
				AND  PE.IsStraightThroughProcess = 0 
				AND	((pe.InsuranceTypeId = @InsuranceTypeAccident) or (pe.InsuranceTypeId = @InsuranceTypeDisease))
				AND (pe.IsDeleted	= 0)	
				AND PW.isDeleted = 0
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
				ORDER BY ' + QUOTENAME(@SortingCol) + N' ASC 
				OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY'
		END
		ELSE IF (@SortType = 'DESC')
		BEGIN
			SET @SqlQuery = N'SELECT * FROM #Pool 
				ORDER BY ' + QUOTENAME(@SortingCol) + N' DESC 
				OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY'
		END

		EXEC sp_executesql @SqlQuery, N'@PageNumber INT, @RowsOfPage INT', @PageNumber, @RowsOfPage;
	END

	BEGIN -- CLEAN UP
		IF OBJECT_ID('tempdb..#Pool') IS NOT NULL DROP TABLE #Pool;
	END
END