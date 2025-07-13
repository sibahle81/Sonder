
CREATE PROCEDURE [medical].[SearchPreAuthorisation]
    @Description    AS VARCHAR(2048) = NULL,                
    @AuthorisedAmount   AS MONEY = NULL,
    @PreAuthNumber    AS VARCHAR(50) = NULL,
    @AuthorisedPractitionerID AS INT = NULL,                
    @DateAuthFromCriteria  AS VARCHAR(200) = NULL,                
    @DateAuthToCriteria   AS VARCHAR(200) = NULL,                
    @AuthType   AS TINYINT = NULL,   
	@TemporaryReferenceNo AS VARCHAR(50) = NULL,      
	@PreAuthStatusID AS INT = NULL,    
	@PreAuthSearchMode AS INT = 0,  
    @PageIndex     AS INT,                 
    @PageSize     AS INT,                
    @RecordCount    AS INT OUTPUT                
AS                
BEGIN             
                
		SET NOCOUNT ON                
                 
		DECLARE @SELECT AS NVARCHAR(4000)                
				,@WhereClause AS NVARCHAR(4000)                
				,@SelectCount AS NVARCHAR(4000)                
				,@OrderByClause AS NVARCHAR(1000)
          
		SET @WhereClause = ''
              
		SET @OrderByClause = ' ORDER BY pa.PreAuthID ASC '                
                 
		SET @SELECT = 'SELECT 
			pa.AuthNumber,
			pa.PreAuthNumber,        
			pa.AuthorisedPractitionerName,                 
			pa.DateAuthorisedFrom,                 
			pa.DateAuthorisedTo,                 
			pa.Description,                 
			pa.TotalAmount,      
			pa.AuthorisedAmount,      
			pa.DateCaptured,      
			pa.DateAuthorised,  
			CASE WHEN pa.IsActive = 1 THEN ''Yes'' ELSE ''No'' END AS IsActive,
			pa.PreAuthID,                
			pa.FileRefNumber,                
			pa.PersonEventID,                
			pa.EventID,                 
			pa.PersonID,            
			pa.AuthType,          
			CASE WHEN pa.IsPreAuthorisation = 1 THEN ''Yes'' ELSE ''No'' END AS IsPreAuthorisation,
			pa.AuthorisedPractitionerID,          
			pa.ClaimID,
			pa.PracticeNumber,
			pa.PersonName,			
			pa.PreAuthStatus FROM (SELECT ROW_NUMBER() OVER (ORDER BY pa.PreAuthID DESC) AS Row, 
			CASE 
			WHEN ' + CONVERT(nvarchar(10),@PreAuthSearchMode) + ' = 0 THEN pa.PreAuthNumber
			WHEN ' + CONVERT(nvarchar(10),@PreAuthSearchMode) + ' = 1 THEN pa.TemporaryReferenceNo   
			END as AuthNumber,
			CASE WHEN pa.IsPreAuthorisation = 1 THEN pa.PreAuthNumber 
				WHEN pa.IsPreAuthorisation =  0 AND pa.AuthType IN (3) THEN REPLACE(pa.PreAuthNumber, SUBSTRING(pa.PreAuthNumber, 4, LEN(pa.PreAuthNumber)), REPLICATE(''X'', LEN(pa.PreAuthNumber)-3))
				ELSE REPLACE(pa.PreAuthNumber, SUBSTRING(pa.PreAuthNumber, 5, LEN(pa.PreAuthNumber)), REPLICATE(''X'', LEN(pa.PreAuthNumber)-4))  
			END AS PreAuthNumber,                 
			hcp.Name AS AuthorisedPractitionerName,  
			hcp.PracticeNo as PracticeNumber,
			pa.Description,
			pa.TotalAmount,      
			pa.AuthorisedAmount,      
			pa.DateCaptured,      
			pa.DateAuthorised,      
			pa.IsActive,            
			pa.PreAuthID,                
			--Compensation.fnGetPersonEventClaimReference(pe.PersonEventID) AS FileRefNumber,        
			--Compensation.fnGetPersonEventMainClaimID(pe.PersonEventID) AS ClaimID,              
			pa.PersonEventID,                
			pe.EventID,                      
			pe.PersonID,                
			pa.AuthType,          
			pa.IsPreAuthorisation,          
			pa.AuthorisedPractitionerID,  
			DateAuthorisedFrom,  
			DateAuthorisedTo,
			--COALESCE(p.Surname,'''') + '','' + COALESCE(p.FirstName,'''')  as PersonName,			 
			pas.Name as PreAuthStatus
		FROM Medical.PreAuthorisation pa        
			LEFT JOIN Medical.PreAuthStatus pas ON pas.PreAuthStatusID = pa.PreAuthStatusID
			INNER JOIN Medical.MedicalServiceProvider hcp ON pa.AuthorisedPractitionerID = hcp.RolePlayerID                 
			INNER JOIN claim.PersonEvent pe ON pa.PersonEventID = pe.PersonEventID'
			--INNER JOIN Compensation.Person p  on pe.PersonID = p.PersonID'                
                    
		SET @SelectCount = 'SELECT @RecordCount = COUNT(1)                 
			FROM medical.PreAuthorisation pa      
			LEFT JOIN common.PreAuthStatus pas ON pas.PreAuthStatusID = pa.PreAuthStatusID
			INNER JOIN medical.HealthCareProvider hcp  ON pa.AuthorisedPractitionerID = hcp.RolePlayerID                 
			INNER JOIN claim.PersonEvent pe ON pa.PersonEventID = pe.PersonEventID'
			--INNER JOIN Compensation.Person p ON pe.PersonID = p.PersonID'                
                         
		IF @PreAuthSearchMode = 0 
			BEGIN
                  
			 --IF @Description IS NOT NULL                
			 -- IF LEN(@WhereClause) > 1                 
			 --  SET @WhereClause = @WhereClause + 'AND pa.Description  LIKE ''%' + @Description + '%'''                
			 -- ELSE                
			 --  SET @WhereClause = ' WHERE pa.Description LIKE ''%' + @Description + '%'''                
       
			 IF @AuthorisedAmount IS NOT NULL                
			  IF LEN(@WhereClause) > 1                 
			   SET @WhereClause = @WhereClause + 'AND pa.AuthorisedAmount  = ' + CAST(@AuthorisedAmount AS VARCHAR)                
			  ELSE                
			   SET @WhereClause = ' WHERE pa.AuthorisedAmount = ' + CAST(@AuthorisedAmount AS VARCHAR)   
                   
			 IF @AuthorisedPractitionerID IS NOT NULL                
			  IF LEN(@WhereClause) > 1                 
			   SET @WhereClause = @WhereClause + 'AND pa.AuthorisedPractitionerID = ' + CAST(@AuthorisedPractitionerID AS VARCHAR)                
			  ELSE                
			   SET @WhereClause = ' WHERE pa.AuthorisedPractitionerID = ' + CAST(@AuthorisedPractitionerID AS VARCHAR)                
                      
			 IF @PreAuthNumber IS NOT NULL                
			  IF LEN(@WhereClause) > 1                 
			   SET @WhereClause = @WhereClause + 'AND pa.PreAuthNumber  LIKE ''%' + @PreAuthNumber + '%'''                
			  ELSE                
			   SET @WhereClause = ' WHERE pa.PreAuthNumber LIKE ''%' + @PreAuthNumber + '%'''      
            
			 IF @AuthType IS NOT NULL                
			  IF LEN(@WhereClause) > 1                 
			   SET @WhereClause = @WhereClause + 'AND pa.AuthType = ' + CAST(@AuthType AS VARCHAR)                
			  ELSE                
			   SET @WhereClause = ' WHERE pa.AuthType = ' + CAST(@AuthType AS VARCHAR)       

			 IF LEN(@DateAuthFromCriteria) > 1                
			  IF LEN(@WhereClause) > 1                
			   SET @WhereClause = @WhereClause + ' AND ' + @DateAuthFromCriteria                
			  ELSE                
			SET @WhereClause = ' WHERE ' + @DateAuthFromCriteria                
                   
			 IF LEN(@DateAuthToCriteria) > 1                
			  IF LEN(@WhereClause) > 1                
			   SET @WhereClause = @WhereClause + ' AND ' + @DateAuthToCriteria                
			  ELSE                
			   SET @WhereClause = ' WHERE ' + @DateAuthToCriteria        
	  
			 IF @PreAuthStatusID IS NOT NULL      
			  IF LEN(@WhereClause)>0      
			   SET @WhereClause = @WhereClause + ' AND pa.PreAuthStatusID = ' + CAST(@PreAuthStatusID AS VARCHAR)      
			  ELSE      
			   SET @WhereClause = 'WHERE pa.PreAuthStatusID = '+ CAST(@PreAuthStatusID AS VARCHAR)            
              

		IF @PreAuthSearchMode = 1
		  BEGIN  
			IF @TemporaryReferenceNo IS NOT NULL
				BEGIN
				  IF LEN(@WhereClause) > 1
				  SET @WhereClause = @WhereClause + 'AND pa.TemporaryReferenceNo like ''%' + @TemporaryReferenceNo + '%''' + 'AND ISNULL(pa.IsClaimLinked, 0) = 0'  
				 ELSE
				  SET @WhereClause = ' WHERE pa.TemporaryReferenceNo like ''%' + @TemporaryReferenceNo + '%''' + 'AND ISNULL(pa.IsClaimLinked, 0) = 0' 
				END
			ELSE
				BEGIN
				  IF LEN(@WhereClause) > 1     
					SET @WhereClause = @WhereClause + 'AND pa.TemporaryReferenceNo IS NOT NULL AND ISNULL(pa.IsClaimLinked, 0) = 0'                
				  ELSE                
				   SET @WhereClause = ' WHERE pa.TemporaryReferenceNo IS NOT NULL AND ISNULL(pa.IsClaimLinked, 0) = 0'
				END	
		 END     
 
		  IF LEN(@WhereClause) > 1                
			 BEGIN                
			  SET @SELECT = @SELECT  + @WhereClause + ') pa '                
			  SET @SelectCount = @SelectCount  + @WhereClause                
			 END                
			 ELSE                
			  SET @SELECT = @SELECT  + ') pa '            
                  

		 SET @SELECT = @SELECT + ' WHERE Row BETWEEN ' + CAST((@PageIndex - 1) * @PageSize + 1 AS NVARCHAR) + ' AND ' + CAST(@PageIndex*@PageSize AS NVARCHAR)                
		 
		 SET @SELECT = @SELECT + @OrderByClause         
                  

END
   
 EXEC SP_EXECUTESQL @SELECT             
                 
 --=============== Following Execution is for Total Records Found Against the Search Criteria to                
 --=============== identify the number of pages at front end. -========================                
 DECLARE @ParamDefinition AS NVARCHAR(50)                 
 SET @ParamDefinition = N'@RecordCount INT OUTPUT'                
                    
 EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount = @RecordCount OUTPUT                
                 
 SET NOCOUNT OFF                
                
END