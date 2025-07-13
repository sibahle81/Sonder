-- =================================================================
-- Author: Michael Ngongoma
-- Created date: 2023/03/24
-- Description: POC for CDA Policy Creation from Service Bus
-- =================================================================







CREATE PROCEDURE [policy].[CreateCDAPolicy]
	@ReferenceNumber AS VARCHAR(50),
	@PolicyNumber AS VARCHAR(30)
AS 
BEGIN  



 /*4993bc3d-2e64-4320-9750-363087572a70
 EXEC [policy].[CreateCDAPolicy] @ReferenceNumber = 'ed3040e6-fd59-4aa0-b0b6-bd26477a7962', @PolicyNumber = '03-202307-290371';
 */
 DECLARE @ReferenceNumberExistInServiceBusTable BIT = 0;
 DECLARE @ReferenceNumberExistInPolicyDataTable BIT = 0;
 DECLARE @BrokerageRepresentativeMapId INT;
 DECLARE @UserName  VARCHAR(30) = 'CreateCDAPolicyProc'	
 DECLARE @CurrentDate  DATETIME =  GETDATE()
 DECLARE @policyIdOutput INT
 --DECLARE @ReferenceNumber VARCHAR(50) = '0d28f10a-ba1e-4073-9e4f-514ba895590c'
 --DECLARE @PolicyNumber VARCHAR(50) = '03-202307-22946';

 BEGIN TRY
	BEGIN TRAN policydata;

SELECT TOP 1 @ReferenceNumberExistInServiceBusTable = 1 
FROM [AZD-MCC_BrokerPortal].[onboarding].[ServiceBusMessages]   
WHERE  [RequestReferenceNumber] = @ReferenceNumber;

SELECT TOP 1 @ReferenceNumberExistInPolicyDataTable = 1 
FROM [AZD-MCC_BrokerPortal].[onboarding].[PolicyData]    
WHERE  ReferenceNumber = @ReferenceNumber; 

SELECT TOP 1  @BrokerageRepresentativeMapId = brp.BrokerageRepresentativeMapId FROM 
[AZD-MCC_BrokerPortal].[onboarding].[PolicyData] opd  WITH (NOLOCK) 
INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[BrokerageRepresentativeMap] brp WITH (NOLOCK)
ON opd.BrokerageRepresentativeMapId = brp.BrokerageRepresentativeMapId
WHERE ReferenceNumber = @ReferenceNumber



IF (@ReferenceNumberExistInServiceBusTable = 1 )
BEGIN 

       IF(@BrokerageRepresentativeMapId IS NULL)
	   BEGIN
			  UPDATE [AZD-MCC_BrokerPortal].[onboarding].[ServiceBusMessages]
				SET    
					[ResponseReferenceNumber]= 'N/A', 
					ResponseDate = GETDATE(),
					ResponseMessage ='BrokerageRepresentativeMapId not found',
					UpdatedAt = @CurrentDate,
				    CreatedAt = @CurrentDate
				WHERE RequestReferenceNumber = @ReferenceNumber;
        END
		ELSE IF (@ReferenceNumberExistInPolicyDataTable = 1)
		BEGIN	
			--1. Update Policy Data Table
			UPDATE [AZD-MCC_BrokerPortal].[onboarding].[PolicyData]
			SET 
				PolicyNumber = @PolicyNumber, 
				ResponseCode = '200',
				ResponseDate = @CurrentDate,
				ResponseMessage ='Policy Created Successfully'
			WHERE ReferenceNumber = @ReferenceNumber;

			--1. Update Service Bus Table
			UPDATE [AZD-MCC_BrokerPortal].[onboarding].[ServiceBusMessages]
			SET    
				[ResponseReferenceNumber]= @PolicyNumber, 
				ResponseDate = @CurrentDate,
				ResponseMessage ='Policy Created Successfully',
				UpdatedAt = @CurrentDate,
				CreatedAt =@CurrentDate
			WHERE [RequestReferenceNumber] = @ReferenceNumber;  
	
		    DECLARE @Policy_Members table (
				[RolePlayerId] int ,
				[PolicyMemberId] int,
				[MemberId] int,				
				[MemberTypeId] int,
				[IsPolicyOwner] bit,
				[IsNewRolePlayer] bit DEFAULT 1
		   	)
		   
	   
		  		  
		   DECLARE @MaxRolePlayerId INT 
		  -- SELECT @MaxRolePlayerId = MAX(RolePlayerId) FROM  [client].[RolePlayer] 				   
		   SELECT   @MaxRolePlayerId =  [NextNumber] FROM   [common].[DocumentNumbers] WHERE [Name] = 'RolePlayerId'
		   
	   
		   INSERT INTO  @Policy_Members(RolePlayerId,PolicyMemberId, MemberId,MemberTypeId ,IsPolicyOwner)	   
		   SELECT ROW_NUMBER() OVER(ORDER BY MemberId ) + @MaxRolePlayerId AS RolePlayerId,PolicyMemberId, MemberId,MemberTypeId ,
		   CASE  WHEN InsuredMemberId = PolicyHolderMemberId THEN 1 ELSE 0 END AS IsPolicyOwner   
           FROM   [AZD-MCC_BrokerPortal].[onboarding].[PolicyMember] opm WITH (NOLOCK) 
		   INNER JOIN  [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on opm.InsuredMemberId = om.MemberId
		   INNER JOIN  [AZD-MCC_BrokerPortal].[onboarding].[PolicyData] opd  WITH (NOLOCK) on opm.PolicyDataId = opd.PolicyDataId
		   WHERE ReferenceNumber = @ReferenceNumber 
	
		   --2.1 Get Role player id's if they already exist
		  
		    UPDATE pm 
			SET [RolePlayerId] = COALESCE (cp.RolePlayerId , pm.RolePlayerId ),
			    [IsNewRolePlayer] = CASE WHEN cp.RolePlayerId IS NULL THEN 1 ELSE 0 END
			FROM @Policy_Members pm 
			INNER JOIN  [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on pm.MemberId = om.MemberId
			LEFT JOIN   [client].[Person]  cp on om.IdNumber = cp.IdNumber
	    
		    SELECT @MaxRolePlayerId = MAX([RolePlayerId]) + 1 FROM @Policy_Members 
			WHERE [IsNewRolePlayer] = 1
			
	       --2.2 Insert new Role players 
		   
		   INSERT INTO [client].[RolePlayer] (RolePlayerId, DisplayName, TellNumber, CellNumber, EmailAddress, PreferredCommunicationTypeId, 
		   RolePlayerIdentificationTypeId, RepresentativeId, AccountExecutiveId, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate,
		   RolePlayerBenefitWaitingPeriodId, ClientTypeId)
		   
		   SELECT  pm.RolePlayerId, FirstName + ' '+ Surname ,TelephoneNumber , MobileNumber,EmailAddress,CommunicationPreferenceId,
		   1,null,null, 0, @UserName,@CurrentDate,@UserName,@CurrentDate,
		   null ,6 
		   FROM  @Policy_Members  pm
		   INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on pm.MemberId = om.MemberId
		   WHERE IsNewRolePlayer = 1
		   
	         
		   --3.1 Insert new  Person
		   
		   INSERT INTO [client].[Person]  (RolePlayerId, FirstName, Surname, IdTypeId, IdNumber, DateOfBirth, IsAlive, DateOfDeath,
		   DeathCertificateNumber, IsVopdVerified, DateVopdVerified, IsStudying, IsDisabled, 
		   GenderId, MaritalStatusId, NationalityId, CountryOriginId, TitleId, IsDeleted, 
		   CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, LanguageId, ProvinceId, PopulationGroup, MarriageDate, MarriageTypeId)
		   
           SELECT pm.RolePlayerId, FirstName,Surname,IdType,IdNumber,DateOfBirth, 1, DateOfDeath , 
		    null,VopdVerified,VopdVerificationDate,0,0,
		   GenderId,null,null,null,null,0,
		   @UserName,@CurrentDate,@UserName,@CurrentDate,null,null,null,null,null
		   FROM   @Policy_Members  pm
		   INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on pm.MemberId = om.MemberId
		   WHERE IsNewRolePlayer = 1
		   
		  -- 3.2 Update existing person
		   
		   UPDATE cp
		   SET FirstName = om.FirstName,
		       Surname = om.Surname,
		       IsVopdVerified = om.VopdVerified,
			   DateVopdVerified = om.VopdVerificationDate,
			   GenderId = om.GenderId,
			   ModifiedBy= @UserName,
			   ModifiedDate = @CurrentDate
		   FROM  [client].[Person]  cp 
		   INNER JOIN @Policy_Members  pm  on  cp.RolePlayerId = pm.RolePlayerId
		   INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on pm.MemberId = om.MemberId 
		   WHERE  IsNewRolePlayer = 0
		   
		   --4.1 Insert RolePlayer Address if not exist
		   
		   INSERT INTO [client].[RolePlayerAddress](RolePlayerId, AddressTypeId, AddressLine1, AddressLine2, PostalCode, City, Province,
		   CountryId, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, EffectiveDate)
		   
		   SELECT pm.RolePlayerId, AddressTypeId,AddressLine1,AddressLine2,PostalCode,City,Province,
		   CountryId,0,@UserName,@CurrentDate,@UserName,@CurrentDate,@CurrentDate
           FROM   @Policy_Members  pm
		   INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on pm.MemberId = om.MemberId
		   WHERE pm.IsPolicyOwner = 1 AND IsNewRolePlayer = 1
		   
		    --4.2 Update existing RolePlayer Address
		   
		   UPDATE  crpa
		   SET AddressTypeId = om.AddressTypeId,
			       AddressLine1 = om.AddressLine1,
				   AddressLine2 = om.AddressLine2,
				   PostalCode = om.PostalCode,
				   City = om.City,
				   Province = om.Province,
				   CountryId = om.CountryId,
				   ModifiedBy = @UserName,
				   ModifiedDate = @CurrentDate,
				   EffectiveDate = @CurrentDate			   
		   FROM  [client].[RolePlayerAddress] crpa  
		   INNER JOIN  @Policy_Members  pm on  crpa.RolePlayerId = pm.RolePlayerId
		   INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on pm.MemberId = om.MemberId 
		   WHERE pm.IsPolicyOwner = 1 AND IsNewRolePlayer = 0
			
			--5 Insert  Policy Details
			 -- NB :  [onboarding].[BrokerageRepresentativeMap] need to be loaded with the Brokerage and Rep from Modernization DB
			 
			
			Declare @policyId INT
			SELECT   @policyId = [NextNumber] FROM   [common].[DocumentNumbers] WHERE [Name] = 'PolicyNumber'
		
			INSERT INTO [policy].[Policy]
			(PolicyId, TenantId, InsurerId, QuoteId, BrokerageId, ProductOptionId, RepresentativeId, JuristicRepresentativeId, PolicyOwnerId, PolicyPayeeId, PaymentFrequencyId, PaymentMethodId, PolicyNumber, 
			PolicyInceptionDate, ExpiryDate, CancellationInitiatedDate, CancellationInitiatedBy, CancellationDate, PolicyCancelReasonId,
			FirstInstallmentDate, LastInstallmentDate, RegularInstallmentDayOfMonth, DecemberInstallmentDayOfMonth, PolicyStatusId, AnnualPremium,
			InstallmentPremium, AdminPercentage, CommissionPercentage, BinderFeePercentage, PremiumAdjustmentPercentage, ClientReference,
			LastLapsedDate, LapsedCount, LastReinstateDate, ReinstateReasonId, PolicyMovementId, ParentPolicyId, PolicyPauseDate, CanLapse, IsEuropAssist,
			EuropAssistEffectiveDate, EuropAssistEndDate, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)


			SELECT @policyId, 1,1,null,BrokerageId,ProductOptionId,RepresentativeId,null,pm.RolePlayerId,pm.RolePlayerId,PaymentFrequencyId,PaymentMethodId,@PolicyNumber,
			StartDate,EndDate,null,null,null,null,
			StartDate,EndDate,InstallmentDayOfMonth,InstallmentDayOfMonth,1,opd.Premium*12, 
			opd.Premium,AdminPercentage,CommissionPercentage,BinderFeePercentage,0.00, @ReferenceNumber,
			null,0,null,null,null,ParentPolicyId,null,0,0,
			null,null,0,@UserName,@CurrentDate,@UserName,@CurrentDate
			FROM   @Policy_Members  pm
			INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on pm.MemberId = om.MemberId
			INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[PolicyMember] opm WITH (NOLOCK)  on pm.PolicyMemberId = opm.PolicyMemberId
		    INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[PolicyData] opd  WITH (NOLOCK) on opm.PolicyDataId = opd.PolicyDataId
		    INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[BrokerageRepresentativeMap] brp WITH (NOLOCK) on opd.BrokerageRepresentativeMapId = brp.BrokerageRepresentativeMapId
		    WHERE pm.IsPolicyOwner = 1
			

		    --6 Insert policy insured lives
		    INSERT INTO [policy].[PolicyInsuredLives]
			(PolicyId, RolePlayerId, StatedBenefitId, RolePlayerTypeId, InsuredLifeStatusId, StartDate, EndDate, InsuredLifeRemovalReasonId,
			Skilltype, Earnings, Allowance, Premium, CoverAmount, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)

            SELECT @policyId,pm.RolePlayerId ,StatedBenefitId,pm.MemberTypeId,1,StartDate,EndDate,null,
			null,null,null,Premium,CoverAmount,0,@UserName,@CurrentDate,@UserName,@CurrentDate
			FROM @Policy_Members  pm
			INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[PolicyMember]  opm  WITH (NOLOCK) on pm.PolicyMemberId = opm.PolicyMemberId
	
	       
			--7 Insert Role player relations
			
			DECLARE @policyOwnerRolePlayerId INT
			SELECT @policyOwnerRolePlayerId = RolePlayerId FROM  @Policy_Members WHERE IsPolicyOwner =1
			
			INSERT INTO [client].[RolePlayerRelation](FromRolePlayerId, ToRolePlayerId, RolePlayerTypeId, PolicyId, AllocationPercentage)
			SELECT pm.RolePlayerId , @policyOwnerRolePlayerId, CASE WHEN IsPolicyOwner =1 THEN 41 ELSE  MemberTypeId END AS RolePlayerTypeId ,@policyId,null
			FROM @Policy_Members pm
			WHERE NOT EXISTS (  SELECT FromRolePlayerId, ToRolePlayerId, RolePlayerTypeId, PolicyId, AllocationPercentage
								FROM  [client].[RolePlayerRelation] crpr WITH (NOLOCK)  
								INNER JOIN @Policy_Members ON crpr.FromRolePlayerId = pm.RolePlayerId 
								AND  crpr.PolicyId = @policyId 
								AND crpr.ToRolePlayerId = @policyOwnerRolePlayerId
								AND crpr.RolePlayerTypeId =  CASE WHEN pm.IsPolicyOwner =1 THEN 41 ELSE  MemberTypeId END 
							 )

			-- 8 Insert policy benefit
		
			INSERT INTO [policy].[PolicyBenefit](PolicyId, BenifitId)
			SELECT DISTINCT @policyId, StatedBenefitId
			FROM @Policy_Members  pm
			INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[PolicyMember]  opm  WITH (NOLOCK) on pm.PolicyMemberId = opm.PolicyMemberId
    
	
	        --9 insert policy broker
			
			INSERT INTO [policy].[PolicyBroker] (PolicyId, RepId, BrokerageId, JuristicRepId, EffectiveDate, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, IsDeleted) 
			SELECT @policyId,RepresentativeId,BrokerageId,null,@CurrentDate,@UserName,@CurrentDate,@UserName,@CurrentDate,0
			FROM   @Policy_Members  pm
			INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[Member]  om  WITH (NOLOCK) on pm.MemberId = om.MemberId
			INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[PolicyMember] opm WITH (NOLOCK)  on pm.PolicyMemberId = opm.PolicyMemberId
		    INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[PolicyData] opd  WITH (NOLOCK) on opm.PolicyDataId = opd.PolicyDataId
		    INNER JOIN [AZD-MCC_BrokerPortal].[onboarding].[BrokerageRepresentativeMap] brp WITH (NOLOCK) on opd.BrokerageRepresentativeMapId = brp.BrokerageRepresentativeMapId
		    WHERE pm.IsPolicyOwner = 1
	
			SELECT @policyIdOutput=@policyId

			UPDATE [common].[DocumentNumbers]
			SET [NextNumber] =  @policyId  + 1
			WHERE [Name] = 'PolicyNumber'
			
			IF(@MaxRolePlayerId IS NOT NULL)
			BEGIN
			
			    UPDATE [common].[DocumentNumbers]
				SET [NextNumber] = @MaxRolePlayerId 
				WHERE [Name] = 'RolePlayerId'
				
			END
			
		END
		ELSE
		BEGIN
			UPDATE [AZD-MCC_BrokerPortal].[onboarding].[ServiceBusMessages]
			SET    
				[ResponseReferenceNumber]= 'N/A', 
				ResponseDate = GETDATE(),
				ResponseMessage ='Reference Number Not Found In Policy Data Table',
				UpdatedAt = @CurrentDate,
			    CreatedAt = @CurrentDate
			where RequestReferenceNumber = @ReferenceNumber;
		END
END
ELSE
BEGIN
	INSERT [AZD-MCC_BrokerPortal].[onboarding].[ServiceBusMessages] ([RequestType], [RequestDate], [RequestReferenceNumber], [ResponseDate], [ResponseReferenceNumber], [ResponseMessage],[UpdatedAt],[CreatedAt])
	VALUES
	(
		'UNKNOWN', GETDATE(), @ReferenceNumber,GETDATE(), 'N/A', 'Request Reference Not Found in Service Bus Table', @CurrentDate , @CurrentDate
	);
END

SELECT @policyIdOutput AS PolicyId;
 
COMMIT TRAN policydata;
		 
END TRY
BEGIN CATCH 
      IF @@TRANCOUNT > 0
      BEGIN
            PRINT 'Rollback transaction';
            ROLLBACK TRAN policydata;
			
	    	UPDATE [AZD-MCC_BrokerPortal].[onboarding].[ServiceBusMessages]
			SET    
				[ResponseReferenceNumber]= 'N/A', 
				ResponseDate = GETDATE(),
				ResponseMessage = 'Stored Proc: [policy].[CreateCDAPolicy] , Error line: '  + CONVERT(varchar(10), ERROR_LINE()) +'. '+  ERROR_MESSAGE(),
				UpdatedAt = @CurrentDate,
			    CreatedAt = @CurrentDate
		    WHERE RequestReferenceNumber = @ReferenceNumber;
			
	       
			
		    SELECT 
	        ERROR_NUMBER() AS ErrorNumber ,
	        ERROR_SEVERITY() AS ErrorSeverity ,
	        ERROR_STATE() AS ErrorState,
	        ERROR_PROCEDURE() AS ErrorProcedure,
	        ERROR_LINE() AS ErrorLine,
	        ERROR_MESSAGE() AS Message
			
      END;
      
     
        -- TO DO:  insert error/ update responsemessage        
      --raiserror('SQL error %d occured in line %d of procedure %s: %s', @err_severity, @err_new_state, @err_number, @err_line, @err_procedure, @err_message);
END CATCH 
END