
CREATE PROCEDURE [pension].[GetPensionClaimDetail]    
	@ClaimReferenceNumber VARCHAR(50)

AS     
BEGIN
	SET NOCOUNT ON  
	    
	DECLARE @ClaimID INT = 0    
		,@NewPensonNotificationID INT = 0  
		,@TypeOfNotification TINYINT = 0
		,@RecordCount INT    
		,@EarningsTypeID INT
		,@MaxEarnings DECIMAL(21,12) = 0
		,@MinEarnings DECIMAL(19,12) = 0
		,@MaxRandValue DECIMAL(21,12) = 0
		,@EarningsAllocation INT = 0
		,@PDLumpSum MONEY = 0
		,@ProductCodeID INT = 0
		,@BenefitCodeID INT = 0
		,@PolicySOIID INT = 0
		,@AssessedPD INT = 0
		,@DateofAccident DATETIME
		,@EarningsID INT = 0
		,@ICD10Code VARCHAR(20)
		,@ICD10CodeDescription VARCHAR(2048)
		,@DRGCode VARCHAR(20)
		,@DRGDescription VARCHAR(2048)

	SELECT @ClaimID = PCM.ClaimID, @NewPensonNotificationID = PN.NewPensionNotificationID, @TypeOfNotification = PN.TypeOfNotification   
	FROM Compcare.Claim PCM    
		INNER JOIN Compcare.NewPensionNotification PN ON PCM.ClaimID = PN.ClaimID  --- Marching on Claim number
	WHERE PCM.FileRefNumber = @ClaimReferenceNumber

	
	IF @ClaimID = 0
		BEGIN
			SELECT @ClaimID = PCM.ClaimID, @TypeOfNotification = PN.TypeOfNotification 
			FROM Compcare.Claim PCM    
				INNER JOIN Compcare.NewPensionNotification PN ON PCM.PersonEventID = PN.PersonEventID --- Marching on Person Event ID
			WHERE PCM.FileRefNumber = @ClaimReferenceNumber	
				AND PCM.ClaimID != PN.ClaimID
				and PCM.isactive = 1
		END

	SELECT @ProductCodeID = P.ProductCodeID
		,@PolicySOIID = C.PolicySOIID
		,@DateofAccident = EventDateTime
	FROM Compcare.Claim C
		INNER JOIN Compcare.Policy P ON C.PolicyID = P.PolicyID
		INNER JOIN Compcare.PersonEvent PE ON C.personeventID = PE.PersonEventID
		INNER JOIN Compcare.Event E on PE.EventID = E.EventID
	WHERE C.ClaimID = @ClaimID

	IF @TypeOfNotification = 1 OR @TypeOfNotification = 2
		BEGIN
			SELECT TOP 1 @BenefitCodeID = BenefitCodeID
			FROM Compcare.BenefitCode
			WHERE BenefitCode.Code = 'DPN'
		END
	ELSE
		BEGIN
			SELECT TOP 1 @BenefitCodeID = BenefitCodeID
			FROM Compcare.BenefitCode
			WHERE BenefitCode.Code = 'Spouse+3Child'
		END

	SELECT @MaxEarnings = MaxEarnings
		,@MinEarnings = MinEarnings
		,@EarningsAllocation = earningsallocation
		,@MaxRandValue = MaxRandValue
	FROM Compcare.PolicyBenefit
	WHERE PolicySOIID = @PolicySOIID
		AND BenefitCodeID = @BenefitCodeID		
		AND @DateofAccident Between StartDate AND EndDate

	IF(@TypeOfNotification = 1)--PDPension
		BEGIN
		SELECT  @AssessedPD = AssessedPD
			FROM Medical.CompcareMedicalAssessment
			WHERE ClaimID = @ClaimID
				AND IsAuthorised = 1
				AND IsActive = 1
		END
	ELSE
		BEGIN
		SELECT TOP 1 @AssessedPD = AssessedPD
			FROM Medical.CompcareMedicalAssessment
			WHERE ClaimID = @ClaimID
				AND IsAuthorised = 1
				AND IsActive = 1
				ORDER BY AssessmentDate DESC, AssessedPD DESC
	END

	SELECT @PDLumpSum = SUM(AuthorisedAmount)
	FROM Compcare.PDAward
	WHERE ClaimID = @ClaimID
		AND AwardStatusID = (SELECT  TOP 1 InvoiceStatusID
			FROM Compcare.InvoiceStatus
			WHERE Name = 'Paid')

	SELECT TOP 1 @EarningsID = E.EarningsID
	FROM Compcare.Earnings E
		INNER JOIN Compcare.EarningsType ET ON e.EarningsTypeID = ET.EarningsTypeID
			AND ET.EarningsTypeID IN (1,3)
		INNER JOIN Compcare.Claim C on E.personEventID = C.personEventID
	WHERE C.ClaimID = @ClaimID AND e.IsActive=1
		ORDER BY ET.EarningsTypeID DESC

	SELECT TOP 1 @ICD10Code = IC.ICD10Code, @ICD10CodeDescription = IC.Description, @DRGCode = ICG.Code, @DRGDescription = ICG.Description   
	FROM Compcare.Claim C     
		INNER JOIN Compcare.PersonEvent PE ON C.PersonEventID = PE.PersonEventID    
		INNER JOIN Claim.CompCarePhysicalDamage PD ON PE.PersonEventID = PD.PersonEventID    
		INNER JOIN Compcare.Injury I ON PD.PhysicalDamageID = I.PhysicalDamageID    
		INNER JOIN digi.CompcareICD10Code IC ON I.ICD10CodeID = IC.ICD10CodeID    
		INNER JOIN digi.CompcareICD10DiagnosticGroup ICG ON IC.ICD10DiagnosticGroupID = ICG.ICD10DiagnosticGroupID    
	WHERE C.ClaimID = @ClaimID 


	IF @NewPensonNotificationID > 0
		BEGIN
			SELECT NULL PensionClaimMapID
				,PCM.ClaimID ClaimId
				,PCM.FileRefNumber ClaimReferenceNumber    
				,ET.EventDateTime DateOfAccident
				,INJ.Description AccidentDescription 
				,NULL Location
				,NULL Injuries    
				,CAST(PN.PDPercentage AS DECIMAL) DisabilityPercentage    
				,CONVERT(DATETIME,(ISNULL(PE.StabilisedDate, P.DateOfDeath)),106) DateOfStabilisation    
				,0 TotalCV 
				,E.Total Earnings    
				,ISNULL(@PDLumpSum,0.0) PensionLumpSum 
				,PEMP.EmployeeNumber CompanyNumber 
				,PCM.UnderwritingYear    
				,COM.ClientId
				,COM.ReferenceNo
				,COM.ReferenceNo + ' ' + COM.Name  Member    
				,P.IndustryNumber          
				,(SELECT TOP 1 Allowance     
							FROM Compcare.SpecialAllowanceTable     
							WHERE pcm.DisabilityExtent BETWEEN FromPDpercentage AND ToPDpercentage    
							AND allowanceYear = YEAR(GETDATE())) AS SAAllowance    
				,PC.ProductCodeID 
				,PC.ProductCode 
				,NULL DateOfDeath   
				,@MaxEarnings MaxEarnings
				,@MinEarnings MinEarnings
				,@EarningsAllocation EarningsAllocation
				,@MaxRandValue MaxRandValue
				,PCM.PersonEventID
				,PC.IsStatProduct
				,@ICD10Code ICD10Driver
				,@ICD10CodeDescription ICD10DriverDescription
				,@DRGCode Drg
				,@DRGDescription DrgDescription
			FROM Compcare.Claim PCM    
				INNER JOIN Compcare.NewPensionNotification PN ON PCM.ClaimID = PN.ClaimID  
				INNER JOIN Compcare.Company COM ON COM.ClientId = PCM.ClientID    
				INNER JOIN Compcare.Policy PLC ON PLC.PolicyId = PCM.PolicyID    
				INNER JOIN Compcare.Productcode PC ON PC.ProductCodeID = PLC.ProductCodeId    
				INNER JOIN Compcare.PersonEvent PE ON PCM.PersonEventID = PE.PersonEventID   
				INNER JOIN Compcare.PersonEmployment PEMP ON PE.PersonEmploymentID = PEMP.PersonEmploymentID    
				INNER JOIN Compcare.Person P ON PE.PersonId = P.PersonID   
				INNER JOIN Compcare.Earnings E ON PCM.PersonEventID = E.PersonEventID AND E.EarningsID = @EarningsID
				INNER JOIN Compcare.Event ET ON PE.EventID = ET.EventID  
			CROSS APPLY (  
				SELECT TOP 1  
					I.Description, PersonEventID  
				FROM Claim.CompCarePhysicalDamage PD   
					INNER JOIN Compcare.Injury I ON I.PhysicalDamageID = PD.PhysicalDamageID    
				WHERE PD.PersonEventID = PE.PersonEventId   
				ORDER BY I.InjuryRank  
			) INJ   
			WHERE PN.NewPensionNotificationID = @NewPensonNotificationID  
		END
	ELSE
		BEGIN
			IF(@TypeOfNotification = 2)
				BEGIN
					IF EXISTS(SELECT 1
								FROM Compcare.Claim C
									INNER JOIN Compcare.NewPensionNotification NP ON C.PersonEventID = NP.PersonEventID
								WHERE NP.PensionStatus = 2
									AND C.ClaimID = @ClaimID
									)
						BEGIN
							SELECT NULL PensionClaimMapID
								,PCM.ClaimID ClaimId
								,PCM.FileRefNumber ClaimReferenceNumber    
								,ET.EventDateTime DateOfAccident
								,INJ.Description AccidentDescription 
								,NULL Location
								,NULL Injuries    
								,CAST(PN.PDPercentage AS DECIMAL) DisabilityPercentage    
								,CONVERT(DATETIME,(ISNULL(PE.StabilisedDate, P.DateOfDeath)),106) DateOfStabilisation    
								,0 TotalCV 
								,E.Total Earnings    
								,ISNULL(@PDLumpSum,0.0) PensionLumpSum 
								,PEMP.EmployeeNumber CompanyNumber 
								,PCM.UnderwritingYear    
								,COM.ClientId
								,COM.ReferenceNo
								,COM.ReferenceNo + ' ' + COM.Name  Member    
								,P.IndustryNumber          
								,(SELECT TOP 1 Allowance     
											FROM Compcare.SpecialAllowanceTable     
											WHERE pcm.DisabilityExtent BETWEEN FromPDpercentage AND ToPDpercentage    
												AND allowanceYear = YEAR(GETDATE())) AS SAAllowance    
								,PC.ProductCodeID 
								,PC.ProductCode 
								,NULL DateOfDeath   
								,@MaxEarnings MaxEarnings
								,@MinEarnings MinEarnings
								,@EarningsAllocation EarningsAllocation
								,@MaxRandValue MaxRandValue
								,PCM.PersonEventID
								,PC.IsStatProduct
								,@ICD10Code ICD10Driver
								,@ICD10CodeDescription ICD10DriverDescription
								,@DRGCode Drg
								,@DRGDescription DrgDescription
							FROM Compcare.Claim PCM    
								INNER JOIN Compcare.NewPensionNotification PN ON PCM.PersonEventID = PN.PersonEventID
								INNER JOIN Compcare.Company COM ON COM.ClientId = PCM.ClientID    
								INNER JOIN Compcare.Policy PLC ON PLC.PolicyId = PCM.PolicyID    
								INNER JOIN Compcare.Productcode PC ON PC.ProductCodeID = PLC.ProductCodeId    
								INNER JOIN Compcare.PersonEvent PE ON PCM.PersonEventID = PE.PersonEventID   
								INNER JOIN Compcare.PersonEmployment PEMP ON PE.PersonEmploymentID = PEMP.PersonEmploymentID    
								INNER JOIN Compcare.Person P ON PE.PersonId = P.PersonID   
								INNER JOIN Compcare.Earnings E ON PN.EarningsID = E.EarningsID  
								INNER JOIN Compcare.Event ET ON PE.EventID = ET.EventID  
								CROSS APPLY (  
									SELECT TOP 1 I.Description, PersonEventID  
									FROM Claim.CompCarePhysicalDamage PD   
										INNER JOIN Compcare.Injury I ON I.PhysicalDamageID = PD.PhysicalDamageID    
									WHERE PD.PersonEventID = PE.PersonEventId   
									ORDER BY I.InjuryRank  
									) INJ   
							WHERE PCM.ClaimID = @ClaimID
							AND E.IsActive=1 
							AND PN.PensionStatus = 2		
						END
				END
			ELSE
				BEGIN
						
					SELECT @RecordCount = COUNT(*)    
					FROM Compcare.Claim PCM    
						INNER JOIN Compcare.PersonEvent PE ON PCM.PersonEventID = PE.PersonEventID    
						INNER JOIN Compcare.ClaimEstimate CE ON CE.ClaimID = PCM.ClaimID    
						INNER JOIN Compcare.Earnings E ON E.EarningsID = CE.EarningsID
						INNER JOIN Compcare.EarningsType ET ON ET.EarningsTypeID = E.EarningsTypeID
							AND ET.EarningsTypeID IN (1,3)  ---- Accident and future Probable Earnings.
					WHERE PCM.ClaimID = @ClaimID    
						AND CE.EarningsId IS NOT NULL 
						AND E.IsActive=1 
						
					IF @REcordCount > 0    
						BEGIN					
							SELECT TOP 1 @EarningsID = E.EarningsID
							FROM Compcare.Earnings e
								INNER JOIN Compcare.EarningsType ET ON e.EarningsTypeID = ET.EarningsTypeID
									AND ET.EarningsTypeID IN (1,3)
								INNER JOIN Compcare.Claim C on E.personEventID = C.personEventID
							WHERE C.ClaimID = @ClaimID
								AND e.IsActive=1 
							ORDER BY ET.EarningsTypeID DESC				
				
							SELECT NULL PensionClaimMapID
								,PCM.ClaimID ClaimId
								,PCM.FileRefNumber ClaimReferenceNumber    
								,ET.EventDateTime DateOfAccident
								,INJ.Description AccidentDescription 
								,NULL Location
								,NULL Injuries    
								,CAST(ISNULL(@AssessedPD,100) AS DECIMAL) PercentageDisability    
								,CONVERT(DATETIME,(ISNULL(PE.StabilisedDate, P.DateOfDeath)),106) DateOfStabilisation    
								,0 TotalCV 
								,E.Total Earnings    
								,ISNULL(@PDLumpSum,0.0) PensionLumpSum 
								,PEMP.EmployeeNumber CompanyNumber 
								,PCM.UnderwritingYear    
								,COM.ClientId
								,COM.ReferenceNo
								,COM.ReferenceNo + ' ' + COM.Name  Member    
								,P.IndustryNumber          
								,(SELECT TOP 1 Allowance     
											FROM Compcare.SpecialAllowanceTable     
											WHERE pcm.DisabilityExtent BETWEEN FromPDpercentage AND ToPDpercentage    
												AND allowanceYear = YEAR(GETDATE())) AS SAAllowance    
								,PC.ProductCodeID 
								,PC.ProductCode 
								,NULL DateOfDeath   
								,@MaxEarnings MaxEarnings
								,@MinEarnings MinEarnings
								,@EarningsAllocation EarningsAllocation
								,@MaxRandValue MaxRandValue
								,PCM.PersonEventID
								,PC.IsStatProduct
								,@ICD10Code ICD10Driver
								,@ICD10CodeDescription ICD10DriverDescription
								,@DRGCode Drg
								,@DRGDescription DrgDescription
							FROM Compcare.Claim PCM    
								INNER JOIN Compcare.Company COM ON COM.ClientId = PCM.ClientID    
								INNER JOIN Compcare.Policy PLC ON PLC.PolicyId = PCM.PolicyID    
								INNER JOIN Compcare.Productcode PC ON PC.ProductCodeID = PLC.ProductCodeId    
								INNER JOIN Compcare.PersonEvent PE ON PCM.PersonEventID = PE.PersonEventID    
								INNER JOIN Compcare.PersonEmployment PEMP ON PE.PersonEmploymentID = PEMP.PersonEmploymentID    
								INNER JOIN Compcare.Person P ON PE.PersonID = P.PersonID    
								INNER JOIN Compcare.Earnings E ON PCM.PersonEventID = E.PersonEventID
									AND E.EarningsID = @EarningsID 
								INNER JOIN Compcare.Event ET ON PE.EventID = ET.EventID    
								CROSS APPLY (  
									SELECT TOP 1 I.Description, PersonEventID  
									FROM Claim.CompCarePhysicalDamage PD   
										INNER JOIN Compcare.Injury I ON I.PhysicalDamageID = PD.PhysicalDamageID    
									WHERE PD.PersonEventID = PE.PersonEventId   
									ORDER BY I.InjuryRank  
								) INJ   
							WHERE PCM.ClaimID = @ClaimID    
							ORDER BY ET.EventDateTime DESC    
						END
					ELSE
						BEGIN
							SELECT NULL PensionClaimMapID
								,PCM.ClaimID ClaimId
								,PCM.FileRefNumber ClaimReferenceNumber    
								,ET.EventDateTime DateOfAccident
								,INJ.Description AccidentDescription 
								,NULL Location
								,NULL Injuries    
								,CAST(ISNULL(@AssessedPD,100) AS DECIMAL) PercentageDisability    
								,CONVERT(DATETIME,(ISNULL(PE.StabilisedDate, P.DateOfDeath)),106) DateOfStabilisation    
								,0 TotalCV 
								,E.Total Earnings    
								,ISNULL(@PDLumpSum,0.0) PensionLumpSum 
								,PEMP.EmployeeNumber CompanyNumber 
								,PCM.UnderwritingYear    
								,COM.ClientId
								,COM.ReferenceNo
								,COM.ReferenceNo + ' ' + COM.Name  Member    
								,P.IndustryNumber          
								,(SELECT TOP 1 Allowance     
											FROM Compcare.SpecialAllowanceTable     
											WHERE pcm.DisabilityExtent BETWEEN FromPDpercentage AND ToPDpercentage    
												AND allowanceYear = YEAR(GETDATE())) AS SAAllowance    
								,PC.ProductCodeID 
								,PC.ProductCode 
								,NULL DateOfDeath   
								,@MaxEarnings MaxEarnings
								,@MinEarnings MinEarnings
								,@EarningsAllocation EarningsAllocation
								,@MaxRandValue MaxRandValue
								,PCM.PersonEventID
								,PC.IsStatProduct
								,@ICD10Code ICD10Driver
								,@ICD10CodeDescription ICD10DriverDescription
								,@DRGCode Drg
								,@DRGDescription DrgDescription
							FROM Compcare.Claim PCM    
								INNER JOIN Compcare.Company COM ON COM.ClientId = PCM.ClientID    
								INNER JOIN Compcare.Policy PLC ON PLC.PolicyId = PCM.PolicyID    
								INNER JOIN Compcare.Productcode PC ON PC.ProductCodeID = PLC.ProductCodeId    
								INNER JOIN Compcare.PersonEvent PE ON PCM.PersonEventID = PE.PersonEventID    
								INNER JOIN Compcare.PersonEmployment PEMP ON PE.PersonEmploymentID = PEMP.PersonEmploymentID    
								INNER JOIN Compcare.Person P ON PE.PersonID = P.PersonID    
								INNER JOIN Compcare.Earnings E ON Pe.Personeventid = e.personeventID
										   AND E.EarningsID = @EarningsID   
								INNER JOIN Compcare.Event ET ON PE.EventID = ET.EventID    
								CROSS APPLY (  
									SELECT TOP 1 I.Description, PersonEventID  
									FROM Claim.CompCarePhysicalDamage PD   
										INNER JOIN Compcare.Injury I ON I.PhysicalDamageID = PD.PhysicalDamageID    
									WHERE PD.PersonEventID = PE.PersonEventId   
									ORDER BY I.InjuryRank  
									) INJ   
							WHERE PCM.ClaimID = @ClaimID AND E.IsActive=1 
							ORDER BY E.LastChangedDate DESC    
						END   

				END	
			END
		 
	SET NOCOUNT OFF
END