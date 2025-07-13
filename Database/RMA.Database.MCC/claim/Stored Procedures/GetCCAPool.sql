

CREATE PROCEDURE [claim].[GetCCAPool] 
(
	@PageNumber			AS	INT,
	@RowsOfPage			AS	INT,
	@SortingCol			AS	VARCHAR(100) = 'iSTopEmployer',
	@SortType			AS	VARCHAR(100) = 'DESC',
	@SearchCreatia		AS	VARCHAR(150) = '',
	@ReAllocate		    AS	BIT	= 0,
	@UserLoggedIn		AS	INT	= 0,
	@workPoolId		    AS	INT	= 0,
	@IsUserBox		    AS	int	= 0,

	@RecordCount		INT = 0 OUTPUT
)
AS

BEGIN
 -- BEGIN --DEBUGGING
	--	DECLARE	@PageNumber		AS INT			=	1;
	--	DECLARE	@RowsOfPage		AS INT			=	50;
	--	DECLARE	@SortingCol		AS VARCHAR(100) =	'iSTopEmployer';
	--	DECLARE	@SortType		AS VARCHAR(100) =	'desc';
	--	DECLARE	@SearchCreatia	AS VARCHAR(150) =	'';
	--	DECLARE @ReAllocate		AS	bit	= 1;
	--	DECLARE @UserLoggedIn   AS	INT	= 252;
	--	DECLARE @workPoolId		AS	int	= 16;
	--	DECLARE @IsUserBox		AS	int	= 0;
	--	DECLARE @RecordCount	INT		=	0 ;
	--END


	BEGIN
		DECLARE	@FullLiabilityAcceptedId INT = (SELECT id FROM common.ClaimLiabilityStatus WHERE	[name] = 'Full Liability Accepted');
		DECLARE	@MedicalLiabilityId INT = (SELECT id FROM common.ClaimLiabilityStatus WHERE	[name] = 'Medical Liability');
		DECLARE @Pending INT = (SELECT id FROM common.ClaimLiabilityStatus WHERE	[name] = 'Pending');
		DECLARE @IsPdVerified BIT = 0;

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
				cl.ClaimId								    AS ClaimId,	
				pe.PersonEventId							AS PersonEventId,
				cl.[ClaimReferenceNumber]                   AS ClaimNumber,
				pe.personEventReferenceNumber               AS PersonEventReference,
				e.EventTypeId								AS EventType,				
				pe.AssignedToUserID							AS AssignedTo,				
				cl.ClaimStatusId							AS ClaimStatus,				
				cl.ClaimLiabilityStatusId					AS LiabilityStatus,			
				EC.[Description]							AS DiseaseDescription,		
				pe.CreatedDate								AS CreatedDate,				
				'P1'									    AS [Priority],													
				p.FirstName + ' ' + p.Surname				AS InsuredLifE,	
				P.IdNumber									AS IdentificationNumber,			
				pe.CreatedBy								AS PersonEventCreatedBy,
				''											AS LastModifiedBy,			
				1											AS InjuryType,
				''									        AS EmployeeNumber,	
				''								            AS EmployeeIndustryNumber,
				0										    AS LastWorkedOnUserId,
				C.IsTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				pe.PersonEventBucketClassId					AS BucketClassId,
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
				END)										AS [Application],
												    
				RANK() OVER (PARTITION BY cl.ClaimId ORDER BY pw.ModifiedDate DESC) AS RowNum
																							     		
				FROM        common.PoolWorkFlow				AS pw	
				INNER JOIN	claim.Claim						AS cl	ON pw.ItemId				    = cl.ClaimId  				
				INNER JOIN  claim.PersonEvent			    AS pe 	ON pe.PersonEventId				= cl.PersonEventId	
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS e	ON pe.EventId					= e.EventId 	
				INNER JOIN  claim.PhysicalDamage            AS pd   ON pd.PersonEventId             = pe.PersonEventId

				INNER JOIN  medical.ICD10GroupMap           AS ig   ON ig.ICD10DiagnosticGroupId    = pd.ICD10DiagnosticGroupId
				INNER JOIN  claim.ICD10CodeEstimateLookup   AS el   ON el.ICD10GroupMapId           = ig.ICD10GroupMapId
				INNER JOIN  claim.PDExtentLookup            AS pel  ON pel.PDExtentLookupId         = el.PDExtentLookupId
				INNER JOIN  claim.MedicalCostLookup         AS mcl  ON mcl.MedicalCostLookupId      = el.MedicalCostLookupId
				INNER JOIN  claim.daysofflookup             AS dol  ON dol.DaysOffLookupId          = el.DaysOffLookupId
							
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON pw.AssignedToUserId = us.id

				WHERE PW.WORKPOOLID in (@WorkPoolId)			
				AND cl.claimLiabilityStatusId in (@FullLiabilityAcceptedId, @MedicalLiabilityId, @Pending)
				AND pe.isfatal != 1
				AND cl.underwriterId = 1
				AND	CL.ClaimStatusId not in (6, 36, 41)
				AND cl.PDVerified = @IsPdVerified
				AND PW.isDeleted = 0
		END

	IF(@ReAllocate = 1 AND @SearchCreatia = 'Unassigned')
		BEGIN
			INSERT INTO #Pool 


		SELECT DISTINCT
				cl.ClaimId								    AS ClaimId,	
				pe.PersonEventId							AS PersonEventId,
				cl.[ClaimReferenceNumber]                   AS ClaimNumber,
				pe.personEventReferenceNumber               AS PersonEventReference,
				e.EventTypeId								AS EventType,				
				pe.AssignedToUserID							AS AssignedTo,				
				cl.ClaimStatusId							AS ClaimStatus,				
				cl.ClaimLiabilityStatusId					AS LiabilityStatus,			
				EC.[Description]							AS DiseaseDescription,		
				pe.CreatedDate								AS CreatedDate,				
				'P1'									    AS [Priority],													
				p.FirstName + ' ' + p.Surname				AS InsuredLifE,	
				P.IdNumber									AS IdentificationNumber,			
				pe.CreatedBy								AS PersonEventCreatedBy,
				''											AS LastModifiedBy,			
				1											AS InjuryType,
				''									        AS EmployeeNumber,	
				''								            AS EmployeeIndustryNumber,
				0										    AS LastWorkedOnUserId,
				C.IsTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				pe.PersonEventBucketClassId					AS BucketClassId,
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
				END)										AS [Application],
												    
				RANK() OVER (PARTITION BY cl.ClaimId ORDER BY pw.ModifiedDate DESC) AS RowNum
																							     		
				FROM        common.PoolWorkFlow				AS pw	
				INNER JOIN	claim.Claim						AS cl	ON pw.ItemId				    = cl.ClaimId  				
				INNER JOIN  claim.PersonEvent			    AS pe 	ON pe.PersonEventId				= cl.PersonEventId	
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS e	ON pe.EventId					= e.EventId 	
				INNER JOIN  claim.PhysicalDamage            AS pd   ON pd.PersonEventId             = pe.PersonEventId

				INNER JOIN  medical.ICD10GroupMap           AS ig   ON ig.ICD10DiagnosticGroupId    = pd.ICD10DiagnosticGroupId
				INNER JOIN  claim.ICD10CodeEstimateLookup   AS el   ON el.ICD10GroupMapId           = ig.ICD10GroupMapId
				INNER JOIN  claim.PDExtentLookup            AS pel  ON pel.PDExtentLookupId         = el.PDExtentLookupId
				INNER JOIN  claim.MedicalCostLookup         AS mcl  ON mcl.MedicalCostLookupId      = el.MedicalCostLookupId
				INNER JOIN  claim.daysofflookup             AS dol  ON dol.DaysOffLookupId          = el.DaysOffLookupId
							
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON pw.AssignedToUserId = us.id

				WHERE PW.WORKPOOLID in (@WorkPoolId)			
				AND cl.claimLiabilityStatusId in (@FullLiabilityAcceptedId, @MedicalLiabilityId, @Pending)
				AND pe.isfatal != 1
				AND cl.underwriterId = 1	
				AND PW.AssignedToUserId is null 
				AND	CL.ClaimStatusId not in (6, 36, 41)
				AND cl.PDVerified = @IsPdVerified
				AND PW.isDeleted = 0
		END

	ELSE IF (@ReAllocate = 0 and @IsUserBox = 0)
		BEGIN
			INSERT INTO #Pool 
		SELECT  DISTINCT
		        cl.ClaimId                                  AS ClaimId,											
				pe.PersonEventId							AS PersonEventId,
				cl.[ClaimReferenceNumber]                   AS ClaimNumber,
				pe.personEventReferenceNumber               AS PersonEventReference,
				e.EventTypeId								AS EventType,				
				pe.AssignedToUserID							AS AssignedTo,				
				cl.ClaimStatusId							AS ClaimStatus,				
				cl.ClaimLiabilityStatusId					AS LiabilityStatus,			
				EC.[Description]							AS DiseaseDescription,		
				pe.CreatedDate								AS CreatedDate,				
				'P1'									    AS [Priority],													
				p.FirstName + ' ' + p.Surname				AS InsuredLifE,	
				P.IdNumber									AS IdentificationNumber,			
				pe.CreatedBy								AS PersonEventCreatedBy,
				''											AS LastModifiedBy,			
				1											AS InjuryType,
				''									        AS EmployeeNumber,	
				''								            AS EmployeeIndustryNumber,
				0										    AS LastWorkedOnUserId,
				C.IsTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				pe.PersonEventBucketClassId					AS BucketClassId,
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

				RANK() OVER (PARTITION BY cl.ClaimId ORDER BY pw.ModifiedDate DESC) AS RowNum
															     		
				FROM        COMMON.POOLWORKFLOW				AS pw	
				INNER JOIN	claim.Claim						AS cl	ON pw.ItemId				    = cl.ClaimId  				
				INNER JOIN  claim.PersonEvent			    AS pe 	ON pe.PersonEventId				= cl.PersonEventId	
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS e	ON pe.EventId					= e.EventId 	
				INNER JOIN  claim.PhysicalDamage            AS pd   ON pd.PersonEventId             = pe.PersonEventId

				INNER JOIN  medical.ICD10GroupMap           AS ig   ON ig.ICD10DiagnosticGroupId    = pd.ICD10DiagnosticGroupId
				INNER JOIN  claim.ICD10CodeEstimateLookup   AS el   ON el.ICD10GroupMapId           = ig.ICD10GroupMapId
				INNER JOIN  claim.PDExtentLookup            AS pel  ON pel.PDExtentLookupId         = el.PDExtentLookupId
				INNER JOIN  claim.MedicalCostLookup         AS mcl  ON mcl.MedicalCostLookupId      = el.MedicalCostLookupId
				INNER JOIN  claim.daysofflookup             AS dol  ON dol.DaysOffLookupId          = el.DaysOffLookupId
							
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON pw.AssignedToUserId = us.id

				WHERE pw.AssignedToUserId is null
				AND PW.WORKPOOLID in (@WorkPoolId)
				AND cl.claimLiabilityStatusId in (@FullLiabilityAcceptedId, @MedicalLiabilityId, @Pending)	
				AND pe.isfatal != 1
				AND cl.underwriterId = 1 
				AND	CL.ClaimStatusId not in (6, 36, 41)
				AND PW.isDeleted = 0
										 												   			
		END

	ELSE IF (@ReAllocate = 0 and @IsUserBox = 1)
		BEGIN
			INSERT INTO #Pool 
		SELECT  DISTINCT
		        cl.ClaimId                                  AS ClaimId,											
				pe.PersonEventId							AS PersonEventId,
				cl.[ClaimReferenceNumber]                   AS ClaimNumber,
				pe.personEventReferenceNumber               AS PersonEventReference,
				e.EventTypeId								AS EventType,				
				pe.AssignedToUserID							AS AssignedTo,				
				cl.ClaimStatusId							AS ClaimStatus,				
				cl.ClaimLiabilityStatusId					AS LiabilityStatus,			
				EC.[Description]							AS DiseaseDescription,		
				pe.CreatedDate								AS CreatedDate,				
				'P1'									    AS [Priority],													
				p.FirstName + ' ' + p.Surname				AS InsuredLifE,	
				P.IdNumber									AS IdentificationNumber,			
				pe.CreatedBy								AS PersonEventCreatedBy,
				''											AS LastModifiedBy,			
				1											AS InjuryType,
				''									        AS EmployeeNumber,	
				''								            AS EmployeeIndustryNumber,
				0										    AS LastWorkedOnUserId,
				C.IsTopEmployer								AS iSTopEmployer,
				1											AS Included,							
				c.[Name]									AS CompanyName,
				c.ReferenceNumber							AS CompanyReferenceNumber,
				pe.PersonEventBucketClassId					AS BucketClassId,
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

				RANK() OVER (PARTITION BY cl.ClaimId ORDER BY pw.ModifiedDate DESC) AS RowNum
															     		
				FROM        COMMON.POOLWORKFLOW				AS pw	
				INNER JOIN	claim.Claim						AS cl	ON pw.ItemId				    = cl.ClaimId  				
				INNER JOIN  claim.PersonEvent			    AS pe 	ON pe.PersonEventId				= cl.PersonEventId	
				INNER JOIN	claim.claimBucketClass			AS CB	ON pe.personEventBucketclassid	= cb.claimBucketClassId
				INNER JOIN	claim.[Event]					AS e	ON pe.EventId					= e.EventId 	
				INNER JOIN  claim.PhysicalDamage            AS pd   ON pd.PersonEventId             = pe.PersonEventId

				INNER JOIN  medical.ICD10GroupMap           AS ig   ON ig.ICD10DiagnosticGroupId    = pd.ICD10DiagnosticGroupId
				INNER JOIN  claim.ICD10CodeEstimateLookup   AS el   ON el.ICD10GroupMapId           = ig.ICD10GroupMapId
				INNER JOIN  claim.PDExtentLookup            AS pel  ON pel.PDExtentLookupId         = el.PDExtentLookupId
				INNER JOIN  claim.MedicalCostLookup         AS mcl  ON mcl.MedicalCostLookupId      = el.MedicalCostLookupId
				INNER JOIN  claim.daysofflookup             AS dol  ON dol.DaysOffLookupId          = el.DaysOffLookupId
							
				INNER JOIN	client.RolePlayer				AS R	ON pe.CompanyRolePlayerId		= r.RolePlayerId
				INNER JOIN	client.Person				    AS P	ON pe.InsuredLifeId				= p.RolePlayerId
				INNER JOIN	client.Company					AS C	ON r.RolePlayerId				= c.RolePlayerId
				INNER JOIN	common.IndustryClass			AS I	ON c.industryClassId			= i.Id
				
				LEFT JOIN   claim.PersonEventDiseaseDetail	AS PED  ON pe.PersonEventId = PED.PersonEventId  
				LEFT JOIN   claim.DiseaseType				AS EC   ON PED.TypeOfDiseaseId = ec.DiseaseTypeID
				LEFT JOIN	[Security].[User]				AS us	ON pw.AssignedToUserId = us.id

				WHERE pw.AssignedToUserId = @UserLoggedIn
				AND PW.WORKPOOLID in (@WorkPoolId)
				AND cl.claimLiabilityStatusId in (@FullLiabilityAcceptedId, @MedicalLiabilityId, @Pending)	
				AND pe.isfatal != 1
				AND cl.underwriterId = 1 
				AND	CL.ClaimStatusId not in (6, 36, 41)
				AND cl.PDVerified = @IsPdVerified
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
				OR	(UserId		            LIKE '%' + @SearchCreatia + '%')
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