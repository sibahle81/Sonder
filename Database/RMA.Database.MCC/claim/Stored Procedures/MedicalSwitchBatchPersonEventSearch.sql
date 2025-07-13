


CREATE PROCEDURE [claim].[MedicalSwitchBatchPersonEventSearch] --@IDNumber = '74984884', @PageNumber = 1, @RowsOfPage = 5
(
    @IndustryNumber   AS VARCHAR(50) = NULL,  
    @SurName    AS VARCHAR(30) = NULL,  
    @FirstName    AS VARCHAR(50) = NULL,  
    @OtherInitial   AS VARCHAR(50) = NULL,  
    @IDNumber    AS VARCHAR(50) = NULL,  
    @OtherIDNumber   AS VARCHAR(50) = NULL,  
    @DateOfBirthCriterion AS VARCHAR(200) = NULL,  
    @EmployeeNumber   AS VARCHAR(50) = NULL,  
    --//@PensionNumber   AS VARCHAR(50) = NULL,  
    @PassportNumber   AS VARCHAR(50) = NULL,  
    @CountryOfPassportID  AS INT = NULL,   
    @EventID    AS INT = NULL,  
    @MainClaimRefNo   AS VARCHAR(50) = NULL,  
    @DateOfEventCriterion AS VARCHAR(200) = NULL,

	/*FOR PAGINATION*/
	@PageNumber AS INT ,
	@RowsOfPage AS INT ,
	@SortingCol AS VARCHAR(100) =' FirstName ',
	@SortType AS VARCHAR(100) = ' ASC ',
	@RecordCount INT = 0 OUTPUT

	)
AS  
BEGIN  


   	Declare @orderQuery AS NVARCHAR(MAX) 
	set @orderQuery = ' ORDER BY '
	  set @orderQuery = @orderQuery + @SortingCol
	  set @orderQuery = @orderQuery + @SortType

Declare @OffSets AS NVARCHAR(MAX) 
set @OffSets = ' OFFSET ('+CAST(@PageNumber as nvarchar(15))+'-1) * '+CAST(@RowsOfPage as nvarchar(15))+' ROWS
		FETCH NEXT '+CAST(@RowsOfPage as nvarchar(15))+' ROWS ONLY '

   	Declare @space AS NVARCHAR(2) 
	set @space = ' '

 DECLARE @SELECT   AS NVARCHAR(MAX),  
   @WhereClause AS NVARCHAR(MAX),  
   @SelectCount AS NVARCHAR(MAX),  
   @OrderByClause AS NVARCHAR(MAX)  
   
 SET @WhereClause = ''  
 SET @SelectCount = ''  
   
 --SET @OrderByClause = ' ORDER BY PP.PersonName '  
   
 IF @IndustryNumber IS NOT NULL 
  SET @WhereClause = ' WHERE employment.EmployeeIndustryNumber = ''' + @IndustryNumber + ''''  
   
 IF @SurName IS NOT NULL  
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND person.SurName = ''' + @SurName + ''''  
  ELSE  
   SET @WhereClause = ' WHERE person.SurName = '''+ @SurName + ''''  
  
 IF @FirstName IS NOT NULL 
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND person.FirstName = ''' + @FirstName + ''''  
  ELSE  
   SET @WhereClause = ' WHERE person.FirstName = '''+ @FirstName + ''''   
     
 IF @OtherInitial IS NOT NULL  
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND SUBSTRING(person.FirstName , 1,1) + SUBSTRING(person.Surname , 1,1)  = ''' + @OtherInitial + ''''  
  ELSE  
   SET @WhereClause = ' WHERE SUBSTRING(person.FirstName , 1,1) + SUBSTRING(person.Surname , 1,1)   = '''+ @OtherInitial + ''''   
  
 IF((@IDNumber IS NOT NULL) OR (@PassportNumber IS NOT NULL))	
BEGIN
SET @IDNumber = ISNULL(@IDNumber, '')  
SET @PassportNumber = ISNULL(@PassportNumber, '')
END
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND person.IdNumber = ''' + @IDNumber + ''''  + ' OR person.IdNumber  = ''' + @PassportNumber + ''''
  ELSE  
	 SET @WhereClause = ' WHERE person.IdNumber = ''' + @IDNumber + ''''  + ' OR person.IdNumber  = ''' + @PassportNumber + ''''

     
 IF @OtherIDNumber IS NOT NULL    
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND person.DeathCertificateNumber = ''' + @OtherIDNumber + ''''  
  ELSE  
   SET @WhereClause = ' WHERE person.DeathCertificateNumber = '''+ @OtherIDNumber + ''''    
     
   
 IF @DateOfBirthCriterion IS NOT NULL  
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND person.DateOfBirth = ''' + @DateOfBirthCriterion + ''''
  ELSE  
   SET @WhereClause = ' WHERE person.DateOfBirth = '''+ @DateOfBirthCriterion + ''''   
   
 IF @EmployeeNumber IS NOT NULL   
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND employment.RMAEmployeeRefNum  = ''' + @EmployeeNumber + ''''  
  ELSE  
   SET @WhereClause = ' WHERE employment.RMAEmployeeRefNum = ''' + @EmployeeNumber + ''''    
  
/*   will enable when pension is available
 IF @PensionNumber IS NOT NULL  
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND p.RMAPensionNumber = ''' + @PensionNumber + ''''  
  ELSE  
   SET @WhereClause = ' WHERE p.RMAPensionNumber = '''+ @PensionNumber + ''''   
     */

 IF @CountryOfPassportID IS NOT NULL  
  IF LEN(@WhereClause)>0  
   SET @WhereClause = @WhereClause + ' AND person.CountryOriginId = ' + CAST(@CountryOfPassportID AS VARCHAR(15))   
  ELSE  
   SET @WhereClause = ' WHERE person.CountryOriginId = '+ CAST(@CountryOfPassportID AS VARCHAR(15))    
     
    
  IF @EventID IS NOT NULL   
   IF LEN(@WhereClause)>0  
    SET @WhereClause = @WhereClause + ' AND personevent.EventID = ' +  CAST(@EventID AS VARCHAR(15)) 
   ELSE  
    SET @WhereClause = ' WHERE personevent.EventID = ' + CAST(@EventID AS VARCHAR(15)) 
      
  IF @MainClaimRefNo IS NOT NULL  
   IF LEN(@WhereClause)>0  
    SET @WhereClause = @WhereClause + ' AND claim.ClaimReferenceNumber LIKE ''%' + @MainClaimRefNo + '%'''  
   ELSE  
    SET @WhereClause = ' WHERE claim.ClaimReferenceNumber LIKE ''%'+ @MainClaimRefNo + '%'''   
  
  IF @DateOfEventCriterion IS NOT NULL   
  IF LEN(@WhereClause)>0  
    SET @WhereClause = @WhereClause + ' AND event.EventDate = ''' + @DateOfEventCriterion + ''''  
   ELSE  
    SET @WhereClause = ' WHERE event.EventDate = '''+ @DateOfEventCriterion + ''''  
    
  SET @SELECT = ' SELECT   
		event.Description as EventDescription,
		event.EventDate as DateOfEvent,
		event.EventId as EventId,
		personevent.PersonEventId AS PersonEventId, 
		ISNULL(claim.ClaimId, 0) AS ClaimId, 
		ISNULL(claim.ClaimReferenceNumber,'''') AS ClaimReferenceNumber,
		claim.ClaimReferenceNumber as MainClaimRefNo,
		CONCAT(person.FirstName,''' + @space + ''', person.Surname) as FullFirstname,
		person.Surname as Surname,
		employment.EmployeeIndustryNumber as IndustryNumber,
		employment.RMAEmployeeRefNum as CoemployeeNo,
		person.IdNumber as IdNumber,
		person.DeathCertificateNumber as OtherIdentification,
		person.IdNumber as PassportNumber,
		SUBSTRING(person.FirstName , 1,1) + SUBSTRING(person.Surname , 1,1) as Initials,
		person.DateOfBirth as DateOfBirth,
		personevent.PersonEventReferenceNumber,
		ISNULL(pead.PersonEventId, 0) AS PersonEventAccidentDetailId,
		ISNULL(personevent.IsFatal, 0) AS IsFatal
		--CASE WHEN personevent.IsFatal IS NULL THEN ''Unknown'' WHEN personevent.IsFatal = 0 THEN ''No'' WHEN personevent.IsFatal = 0 THEN ''Yes'' END AS IsFatal
	   FROM client.RolePlayer role
	   INNER JOIN client.Person person ON role.RolePlayerId = person.RolePlayerId 
	   INNER JOIN claim.PersonEvent personevent ON  role.RolePlayerId = personevent.InsuredLifeId 
	   INNER JOIN claim.Event event ON personevent.EventId = event.EventId 
	   LEFT JOIN claim.PersonEventAccidentDetail pead ON personevent.PersonEventId = pead.PersonEventId
	   LEFT JOIN claim.Claim claim ON  personevent.PersonEventId = claim.PersonEventId 
	   INNER JOIN client.PersonEmployment employment ON personevent.PersonEmploymentId = employment.PersonEmpoymentId  ' 


             
  IF LEN(@WhereClause)>0  
  BEGIN  
   SET @SELECT = @SELECT  + @WhereClause + @orderQuery + @OffSets
   --+ ') PP'  
  END  
  ELSE   
   SET @SELECT = @SELECT + @orderQuery + @OffSets
   --+ ') PP'   


  EXEC SP_EXECUTESQL @SELECT   


	  --=============== Following Execution is for Total Records Found Against the Search Criteria to  
  --=============== identify the number of pages at front end - Pagination. -========================  
  	SET @SelectCount = 'SELECT @RecordCount = (SELECT 
		COUNT(*)   
	   FROM client.RolePlayer role

	   INNER JOIN client.Person person ON role.RolePlayerId = person.RolePlayerId 
	   INNER JOIN claim.PersonEvent personevent ON  role.RolePlayerId = personevent.InsuredLifeId
	   INNER JOIN claim.Event event ON personevent.EventId = event.EventId 
	   LEFT JOIN claim.Claim claim ON  personevent.PersonEventId = claim.PersonEventId 
	   INNER JOIN client.PersonEmployment employment ON personevent.PersonEmploymentId = employment.PersonEmpoymentId
		'+@WhereClause+')'

  DECLARE @ParamDefinition AS NVARCHAR(50)   
  SET @ParamDefinition = N'@RecordCount INT OUTPUT'  
      
  EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT  


END


GO
