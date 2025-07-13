-- =============================================
-- Author:		Phumlane Maseko
-- =============================================
CREATE PROCEDURE [Load].[CreateGPAPolicies]
	-- Add the parameters for the stored procedure here
		@fileIdentifier uniqueidentifier,
		@productOptionId int
AS
BEGIN
	DECLARE @GpaId int
	SET NOCOUNT ON;
	DECLARE @rolePlayerId int;
	DECLARE @policyId int
	DECLARE @policyNumber nvarchar(30)
	DECLARE @statedBenefitId int
	DECLARE @Premium money
	DECLARE @CoverAmount money
	DECLARE @IdNumber nvarchar(20)
	DECLARE @BenefitId CHAR(10)
	DECLARE @CompanyRolePlayerId int
	DECLARE @CompanyName nvarchar(50)
	DECLARE @AdditionalBenefitId int
	DECLARE @ProductOptionChange bit
	--Create Company as roleplayer 
	 SELECT @CompanyRolePlayerId = RolePlayerId, @CompanyName = DisplayName 
										FROM client.RolePlayer WHERE  DisplayName =  (select top 1 g.Company from load.GPA g where FileIdentifier =@fileIdentifier )

	IF @CompanyRolePlayerId IS NULL Or  @CompanyRolePlayerId = 0
		BEGIN
			SET @CompanyRolePlayerId =  (SELECT ((SELECT MAX( RolePlayerId ) FROM client.RolePlayer) +1))
			SET @CompanyName =  (select top 1 Company from load.GPA where FileIdentifier =@fileIdentifier )
			INSERT INTO [client].[RolePlayer]
					   ([RolePlayerId]
					   ,[DisplayName]
					   ,[TellNumber]
					   ,[CellNumber]
					   ,[EmailAddress]
					   ,[PreferredCommunicationTypeId]
					   ,[RolePlayerIdentificationTypeId]
					   ,[RepresentativeId]
					   ,[AccountExecutiveId]
					   ,[IsDeleted]
					   ,[CreatedBy]
					   ,[CreatedDate]
					   ,[ModifiedBy]
					   ,[ModifiedDate]
					   ,[RolePlayerBenefitWaitingPeriodId]
					   ,[ClientTypeId]
					   ,[MemberStatusId])
				 VALUES
					   (@CompanyRolePlayerId
					   ,@CompanyName
					   ,NULL
					   ,NULL
					   ,NULL
					   ,NULL
					   ,2
					   ,NULL
					   ,NULL
					   ,0
					   ,'BackendProcess'
					   ,GETDATE()
					   ,'BackendProcess'
					   ,GETDATE()
					   ,NULL
					   ,3 -- Company
					   ,3-- Active
					   )
		
								 SET @policyId = (SELECT ((SELECT MAX( PolicyId ) FROM policy.Policy) +1))
								 SET @policyNumber = CONCAT('01-', CAST(GETDATE() AS DATE), '-', @policyId)
							 -- Insert policy details
								INSERT INTO [policy].[Policy]
									   ([PolicyId]
									   ,[TenantId]
									   ,[InsurerId]
									   ,[QuoteId]
									   ,[BrokerageId]
									   ,[ProductOptionId]
									   ,[RepresentativeId]
									   ,[JuristicRepresentativeId]
									   ,[PolicyOwnerId]
									   ,[PolicyPayeeId]
									   ,[PaymentFrequencyId]
									   ,[PaymentMethodId]
									   ,[PolicyNumber]
									   ,[PolicyInceptionDate]
									   ,[ExpiryDate]
									   ,[CancellationInitiatedDate]
									   ,[CancellationInitiatedBy]
									   ,[CancellationDate]
									   ,[PolicyCancelReasonId]
									   ,[FirstInstallmentDate]
									   ,[LastInstallmentDate]
									   ,[RegularInstallmentDayOfMonth]
									   ,[DecemberInstallmentDayOfMonth]
									   ,[PolicyStatusId]
									   ,[AnnualPremium]
									   ,[InstallmentPremium]
									   ,[AdminPercentage]
									   ,[CommissionPercentage]
									   ,[BinderFeePercentage]
									   ,[PremiumAdjustmentPercentage]
									   ,[ClientReference]
									   ,[LastLapsedDate]
									   ,[LapsedCount]
									   ,[LastReinstateDate]
									   ,[ReinstateReasonId]
									   ,[PolicyMovementId]
									   ,[ParentPolicyId]
									   ,[PolicyPauseDate]
									   ,[CanLapse]
									   ,[IsEuropAssist]
									   ,[EuropAssistEffectiveDate]
									   ,[EuropAssistEndDate]
									   ,[IsDeleted]
									   ,[CreatedBy]
									   ,[CreatedDate]
									   ,[ModifiedBy]
									   ,[ModifiedDate])
								 VALUES( 
										@policyId
									   ,1 
									   ,1 
									   ,NULL 
									   ,6
									   ,@productOptionId
									   ,8  -- Test 
									   ,NULL 
									   ,@CompanyRolePlayerId
									   ,@CompanyRolePlayerId
									   ,2  --Monthly
									   ,6  -- Company Cheque
									   ,@policyNumber 
									   ,getdate()  
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,(SELECT CAST(LEFT(DATEADD(m,1,GETDATE()-DAY(GETDATE())+1),11) AS date)) 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,22  -- New
									   ,0.00 
									   ,0.00 
									   ,0.00 
									   ,0.00 
									   ,0.00 
									   ,0.00 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,NULL 
									   ,0 
									   ,0 
									   ,NULL 
									   ,NULL 
									   ,0 
									   ,'BackEndProcess' 
									   ,GETDATE() 
									   ,'BackEndProcess' 
									   ,GETDATE() 
							)

							-- Link Policy benefits 
								DECLARE C_Benefit CURSOR 
											FOR SELECT b.Id FROM product.Benefit b
														WHERE b.Id in (SELECT BenefitId FROM product.ProductOptionBenefit pob
														WHERE pob.ProductOptionId = @productOptionId)						
										OPEN C_Benefit
										FETCH NEXT FROM C_Benefit INTO @BenefitId
										WHILE @@FETCH_STATUS = 0 BEGIN

													 INSERT INTO [policy].[PolicyBenefit]
														   ([PolicyId]
														   ,[BenifitId])
													 VALUES
														   (@policyId
														   ,@BenefitId)
												FETCH NEXT FROM C_Benefit INTO @BenefitId
					 	
											END
										CLOSE C_Benefit
								DEALLOCATE C_Benefit
		END
		ELSE
			BEGIN 
			
							DECLARE @currentProductOptionId int

							SELECT @currentProductOptionId= ProductOptionId, 
								   @policyId = PolicyId  
							FROM  policy.Policy p where p.PolicyOwnerId =@CompanyRolePlayerId 
							
				
				IF(@currentProductOptionId <> @productOptionId)
								BEGIN
								          SET @ProductOptionChange = 1
										  -- Delink existing product benefits
										   Delete FROM [policy].[PolicyBenefit]
										   WHERE PolicyId = @policyId
										   -- Update Policy with new product option
										   UPDATE policy.policy 
											   SET ProductOptionId = @productOptionId,
											   ModifiedBy = 'BackendProcess',
											   ModifiedDate = GetDate()
										   WHERE PolicyId = @policyId

										   -- Link Policy benefits for updated product option
										DECLARE C_Benefit CURSOR 
													FOR SELECT b.Id FROM product.Benefit b
																WHERE b.Id in (SELECT BenefitId FROM product.ProductOptionBenefit pob
																WHERE pob.ProductOptionId = @productOptionId)						
												OPEN C_Benefit
												FETCH NEXT FROM C_Benefit INTO @BenefitId
												WHILE @@FETCH_STATUS = 0 BEGIN

															 INSERT INTO [policy].[PolicyBenefit]
																   ([PolicyId]
																   ,[BenifitId])
															 VALUES
																   (@policyId
																   ,@BenefitId)
														FETCH NEXT FROM C_Benefit INTO @BenefitId
					 	
													END
												CLOSE C_Benefit
										DEALLOCATE C_Benefit

										
								END 
			END 
								
	DECLARE C_gpa CURSOR 
				FOR SELECT member.Id FROM load.GPAMembers member
							WHERE member.FileIdentifier = @fileIdentifier	
											
			OPEN C_gpa
			FETCH NEXT FROM C_gpa INTO @GpaId
			WHILE @@FETCH_STATUS = 0 BEGIN
					SET @IdNumber = (select g.IdNumber from load.GPAMembers g where g.id =@GpaId)
					SET @rolePlayerId = (select p.RolePlayerId from client.person p where p.IdNumber =@IdNumber)
					IF @rolePlayerId IS NULL Or  @rolePlayerId = 0
						BEGIN
								SET @rolePlayerId =  (SELECT ((SELECT MAX( RolePlayerId ) FROM client.RolePlayer) +1))
							-- Insert new  Roleplayer
								INSERT INTO [client].[RolePlayer]
										   ([RolePlayerId]
										   ,[DisplayName]
										   ,[TellNumber]
										   ,[CellNumber]
										   ,[EmailAddress]
										   ,[PreferredCommunicationTypeId]
										   ,[RolePlayerIdentificationTypeId]
										   ,[RepresentativeId]
										   ,[AccountExecutiveId]
										   ,[IsDeleted]
										   ,[CreatedBy]
										   ,[CreatedDate]
										   ,[ModifiedBy]
										   ,[ModifiedDate]
										   ,[RolePlayerBenefitWaitingPeriodId]
										   ,[ClientTypeId]
										   ,[MemberStatusId])
											SELECT @rolePlayerId [RolePlayerId]        
										   ,(gpa.FirstName + ' '+ gpa.LastName) [DisplayName]
										   ,NULL [TellNumber]
										   ,gpa.CelNo [CellNumber]
										   ,gpa.Email [EmailAddress]
										   ,2 PreferredCommunicationTypeId -- Phone
										   ,gpa.IdTypeId [RolePlayerIdentificationTypeId]
										   ,NULL [RepresentativeId] 
										   ,NULL [AccountExecutiveId]
										   ,0 [IsDeleted]
										   ,'BackEndProcess' [CreatedBy]
										   ,GetDate() [CreatedDate]
										   ,'BackEndProcess' [ModifiedBy]
										   ,GetDate() [ModifiedDate]
										   ,Null [RolePlayerBenefitWaitingPeriodId]
										   ,6 [ClientTypeId] -- Group Individual 
										   ,3 [MemberStatusId] -- Active
									FROM [Load].[GPAMembers] gpa
									WHERE gpa.id = @GpaId
							-- Insert Person 
								INSERT INTO [client].[Person]
											   ([RolePlayerId]
											   ,[FirstName]
											   ,[Surname]
											   ,[IdTypeId]
											   ,[IdNumber]
											   ,[DateOfBirth]
											   ,[IsAlive]
											   ,[DateOfDeath]
											   ,[DeathCertificateNumber]
											   ,[IsVopdVerified]
											   ,[DateVopdVerified]
											   ,[IsStudying]
											   ,[IsDisabled]
											   ,[GenderId]
											   ,[MaritalStatusId]
											   ,[NationalityId]
											   ,[CountryOriginId]
											   ,[TitleId]
											   ,[IsDeleted]
											   ,[CreatedBy]
											   ,[CreatedDate]
											   ,[ModifiedBy]
											   ,[ModifiedDate]
											   ,[LanguageId]
											   ,[ProvinceId]
											   ,[PopulationGroup]
											   ,[MarriageDate]
											   ,[MarriageTypeId])
											SELECT @rolePlayerId [RolePlayerId] 
											   ,gpa.FirstName FirstName
											   ,gpa.Lastname Surname
											   ,gpa.IdTypeId IdTypeId
											   ,gpa.IdNumber IdNumber
											   ,gpa.DateOfBirth DateOfBirth
											   , 1 IsAlive
											   ,NULL DateOfDeath
											   ,NULL DeathCertificateNumber
											   ,0 IsVopdVerified
											   ,NULL DateVopdVerified
											   ,0 IsStudying
											   ,0 IsDisabled
											   , (select Id from common.gender where Name = gpa.Gender) GenderId
											   ,NULL MaritalStatusId
											   ,NULL NationalityId
											   ,NULL CountryOriginId
											   ,NULL TitleId
											   ,0 IsDeleted
											   ,'BackendProcess' CreatedBy
											   ,GETDATE() CreatedDate
											   ,'BackendProcess' ModifiedBy
											   ,GETDATE() ModifiedDate
											   ,NuLL LanguageId
											   ,NULL ProvinceId
											   ,NULL PopulationGroup
											   ,NULL MarriageDate
											   ,NULL MarriageTypeId
									 FROM [Load].[GPAMembers] gpa
									 WHERE gpa.id =@GpaId							

							--Insert Policy Insured Lives
								SET @statedBenefitId = (SELECT top 1 b.Id FROM product.Benefit b
														WHERE b.Id in (SELECT BenefitId FROM product.ProductOptionBenefit pob
														WHERE pob.ProductOptionId = @productOptionId and b.BenefitTypeId=1))

										SELECT @Premium = br.BaseRate,
													 @CoverAmount = br.BenefitAmount
													 FROM product.BenefitRate br WHERE BenefitId = @statedBenefitId
								INSERT INTO [policy].[PolicyInsuredLives]
													   ([PolicyId]
													   ,[RolePlayerId]
													   ,[StatedBenefitId]
													   ,[RolePlayerTypeId]
													   ,[InsuredLifeStatusId]
													   ,[StartDate]
													   ,[EndDate]
													   ,[InsuredLifeRemovalReasonId]
													   ,[Skilltype]
													   ,[Earnings]
													   ,[Allowance]
													   ,[Premium]
													   ,[CoverAmount]
													   ,[IsDeleted]
													   ,[CreatedBy]
													   ,[CreatedDate]
													   ,[ModifiedBy]
													   ,[ModifiedDate])
												 VALUES
													   (@policyId
													   ,@rolePlayerId
													   ,@statedBenefitId
													   ,10 --Main Member
													   ,1 -- Active
													   ,Getdate()
													   ,NULL
													   ,NULL
													   ,NULL
													   ,NULL
													   ,NULL
													   ,@Premium
													   ,@CoverAmount
													   ,0
													   ,'BackEndProcess'
													   ,GETDATE()
													   ,'BackEndProcess'
													   ,GETDATE())
								--Insert Policy Insured Lives Additional benefits 
								
								DECLARE C_Additional_Benefit CURSOR 
											FOR SELECT b.Id FROM product.Benefit b
														WHERE b.Id in (SELECT BenefitId FROM product.ProductOptionBenefit pob
														WHERE pob.ProductOptionId = @productOptionId
														AND BenefitTypeId <> 1)						
										OPEN C_Additional_Benefit
										FETCH NEXT FROM C_Additional_Benefit INTO @AdditionalBenefitId
										WHILE @@FETCH_STATUS = 0 BEGIN
												INSERT INTO [policy].[PolicyInsuredLifeAdditionalBenefits]
														   ([PolicyId]
														   ,[RolePlayerId]
														   ,[BenefitId]
														   ,[IsDeleted]
														   ,[CreatedBy]
														   ,[CreatedDate]
														   ,[ModifiedBy]
														   ,[ModifiedDate])
													 VALUES
														   (@policyId
														   ,@rolePlayerId
														   ,@AdditionalBenefitId
														   ,0
														   ,'BackendProcess'
														   ,GetDate()
														   ,'BackendProcess'
														   ,GETDATE())

												FETCH NEXT FROM C_Additional_Benefit INTO @AdditionalBenefitId
					 	
											END
										CLOSE C_Additional_Benefit
								DEALLOCATE C_Additional_Benefit
						END 
					ELSE
						BEGIN		
						--Update Person
							UPDATE
								[client].[Person] 						
									SET
											   [client].[Person].[FirstName] = g.FirstName
											  ,[client].[Person] . [Surname] = g.LastName
											  ,[client].[Person].[IdTypeId] = g.IdTypeId
											  ,[client].[Person].[IdNumber] = g.IdNumber
											  ,[client].[Person].[DateOfBirth] = g.DateOfBirth
											  ,[client].[Person].[GenderId] =(select Id from common.gender where Name = g.Gender)
											  ,[client].[Person] .[ModifiedBy] = 'BackendProcess'
											  ,[client].[Person] .[ModifiedDate] = Getdate()		
									FROM Load.GPAMembers g					
							WHERE   g.id = @GpaId
							And [client].[Person].RolePlayerId = @rolePlayerId

						--Update RolePlayer 
						UPDATE
								  [client].[RolePlayer]
								    SET
										   [client].[RolePlayer].[DisplayName] =(g.FirstName + ' '+ g.LastName) 
										  ,[client].[RolePlayer].[CellNumber] = g.CelNo
										  ,[client].[RolePlayer].[EmailAddress] = g.Email
										  ,[client].[RolePlayer].[RolePlayerIdentificationTypeId] = g.IdTypeId
										  ,[client].[RolePlayer].[ModifiedBy] = 'BackendProcess'
										  ,[client].[RolePlayer] .[ModifiedDate] = Getdate()		
									FROM Load.GPAMembers g					
							WHERE   g.id = @GpaId
							AND [client].[RolePlayer].RolePlayerId =@rolePlayerId


							IF (@ProductOptionChange = 1)
									BEGIN
										SET @statedBenefitId = (SELECT top 1 b.Id FROM product.Benefit b
															WHERE b.Id in (SELECT BenefitId FROM product.ProductOptionBenefit pob
															WHERE pob.ProductOptionId = @productOptionId and b.BenefitTypeId=1))
								-- Update statedbenefit
										SET @statedBenefitId = (SELECT top 1 b.Id FROM product.Benefit b
															WHERE b.Id in (SELECT BenefitId FROM product.ProductOptionBenefit pob
															WHERE pob.ProductOptionId = @productOptionId and b.BenefitTypeId=1))
											UPDATE policy.PolicyInsuredLives
												SET StatedBenefitId = @statedBenefitId
											WHERE PolicyId = @policyId
									END

							--Update Insured Lives additional benefits 
							DECLARE C_Additional_Benefit CURSOR 
											FOR SELECT b.Id FROM product.Benefit b
														WHERE b.Id in (SELECT BenefitId FROM product.ProductOptionBenefit pob
														WHERE pob.ProductOptionId = @productOptionId
														AND BenefitTypeId <> 1		
														AND BenefitId NOT IN (SELECT BenefitId FROM  [policy].[PolicyInsuredLifeAdditionalBenefits] WHERE RolePlayerId = @rolePlayerId))			
										OPEN C_Additional_Benefit
										FETCH NEXT FROM C_Additional_Benefit INTO @AdditionalBenefitId
										WHILE @@FETCH_STATUS = 0 BEGIN
												INSERT INTO [policy].[PolicyInsuredLifeAdditionalBenefits]
														   ([PolicyId]
														   ,[RolePlayerId]
														   ,[BenefitId]
														   ,[IsDeleted]
														   ,[CreatedBy]
														   ,[CreatedDate]
														   ,[ModifiedBy]
														   ,[ModifiedDate])
													 VALUES
														   (@policyId
														   ,@rolePlayerId
														   ,@AdditionalBenefitId
														   ,0
														   ,'BackendProcess'
														   ,GetDate()
														   ,'BackendProcess'
														   ,GETDATE())

												FETCH NEXT FROM C_Additional_Benefit INTO @AdditionalBenefitId
					 	
											END
										CLOSE C_Additional_Benefit
								DEALLOCATE C_Additional_Benefit
					END		
						
	FETCH NEXT FROM C_gpa INTO @GpaId
					 	
				END
			CLOSE C_gpa
	DEALLOCATE C_gpa
	
 END