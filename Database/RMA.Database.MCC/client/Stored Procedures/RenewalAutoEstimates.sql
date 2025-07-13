

 --EXEC [client].[RenewalAutoEstimates]
CREATE PROCEDURE [client].[RenewalAutoEstimates] 
(
	@IndustryClassId INT,
	@DeclarationType INT,
	@PenaltyPercentage decimal(15,10),
	@InflationPercentage decimal(15,10),
	@DeclarationYear INT,
	@DeclarationConfigurationDetailId INT
)
AS 
BEGIN 

	--DECLARE
	--	@IndustryClassId INT,
	--	@DeclarationType INT,
	--	@PenaltyPercentage Float,
	--	@InflationPercentage Float,
	--	@DeclarationYear INT,
	--	@DeclarationConfigurationDetailId INT

	--Set @IndustryClassId = 1
	--Set @DeclarationType = 2
	--Set @PenaltyPercentage = 0
	--Set @InflationPercentage = 5
	--Set @DeclarationYear = 2022
	--Set @DeclarationConfigurationDetailId = 12

	Declare @DeclarationTypeName varchar(50)
	--Declare @NumberRecords int, @RowCounter int, @RowCounterInsert int,@ErrorsCount int

	--Declare @ActivePolicies Table(
	--	[PolicyOwnerId] INT,
	--	[ProductOptionId] INT
	--)

	--Declare @ClientCompany table (
	--	[RowID] int IDENTITY(1, 1), 
	--	[RolePlayerId] Int,
	--	[Name] varchar(255),
	--	[Description] varchar(255),
	--	[ReferenceNumber] varchar(50),
	--	[CompensationFundReferenceNumber] varchar(50),
	--	[CompanyIdTypeId] Int,
	--	[IdNumber] varchar(50),
	--	[VatRegistrationNo] varchar(50),
	--	[IndustryId] Int,
	--	[IndustryClassId] Int,
	--	[CompanyLevelId] Int
	--)

	--Insert into @ClientCompany (RolePlayerId,[Name],[Description],ReferenceNumber,CompensationFundReferenceNumber,CompanyIdTypeId,IdNumber,VatRegistrationNo,IndustryId,IndustryClassId,CompanyLevelId)
	--	Select RolePlayerId,[Name],[Description],ReferenceNumber,CompensationFundReferenceNumber,CompanyIdTypeId,IdNumber,VatRegistrationNo,IndustryId,IndustryClassId,CompanyLevelId 
	--	From client.Company where IndustryClassId = @IndustryClassId order by 1

	Select @DeclarationTypeName = [Name] FROM [Common].[DeclarationType] where Id = @DeclarationType
	--print @DeclarationTypeName

	--select * from @ClientCompany
	--Select @NumberRecords = COUNT(*) FROM @ClientCompany
	--Set @RowCounter = 1
	--Declare @RolePlayerId Int
	--Declare @Rate Decimal(8,2), @MemberNo varchar(50)
	--Declare @PenaltyRate float
	--Set @Rate = 0

	--DECLARE @ClientDeclarations table (
	--	DeclarationID int IDENTITY(1, 1),
	--	DeclarationStatusId int,
	--	DeclarationTypeId int,
	--	DeclarationRenewalStatusId int,
	--	RolePlayerId int,
	--	DeclarationYear int,
	--	ProductOptionId int,
	--	AverageEmployeeCount int,
	--	AverageEarnings decimal,
	--	PenaltyPercentage decimal,
	--	Rate decimal,
	--	Premium decimal,
	--	PenaltyRate decimal,
	--	PenaltyPremium decimal,
	--	Adjustment decimal,
	--	Comment varchar(255),
	--	IsDeleted bit
	--)




	DECLARE @ClientDeclarations table (
		DeclarationID int IDENTITY(1, 1),
		DeclarationStatusId int,
		DeclarationTypeId int,
		DeclarationRenewalStatusId int,
		RolePlayerId int,
		DeclarationYear int,
		ProductOptionId int,
		AverageEmployeeCount int,
		AverageEarnings decimal(12,2),
		PenaltyPercentage decimal(12,2),
		Rate decimal(15,10),
		Premium decimal(12,2),
		PenaltyRate decimal(15,10),
		PenaltyPremium decimal(12,2),
		Adjustment decimal(12,2),
		Comment varchar(255),
		IsDeleted bit,
		ParentOptionId int,
		ParentRate decimal(15,10),
		ChildPercentage decimal(12,2),
		InsertNew bit
	)

	--DECLARE @IndustryClassId INT = 2
	--DECLARE @PenaltyPercentage decimal(15,10) = 10
	--DECLARE @InflationPercentage decimal(15,10) = 5
	--DECLARE @DeclarationYear INT = 2022
	--DECLARE @DeclarationTypeName varchar(50) = 'Actual And Budgeted'--'Budgeted'

	IF (@DeclarationTypeName = 'Actual')
	BEGIN
		INSERT INTO @ClientDeclarations (DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,
							AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,PenaltyRate,PenaltyPremium,
							Adjustment,Comment,IsDeleted, ParentOptionId, ParentRate, ChildPercentage, InsertNew)

		SELECT 2,3,1, D.RolePlayerId, D.DeclarationYear, D.ProductOptionId, D.AverageEmployeeCount, (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100),
							@PenaltyPercentage, /*ISNULL(R.Rate, 0)*/ 0, (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100),-- * (@Rate / 100),
							/*ISNULL(R.Rate, 0)*/ 0 * (1 + @PenaltyPercentage/100), (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100), --* (@PenaltyRate * 0.01), 
							NULL, NULL, 0, 0, 0, 0, 0
		FROM client.Declaration D
		JOIN client.Company C ON D.RolePlayerId = C.RolePlayerID
		--JOIN client.FinPayee F ON D.RolePlayerId = F.RolePlayerId
		--LEFT JOIN client.Rates R ON F.FinPayeNumber = R.MemberNo
		WHERE C.IndustryClassId = @IndustryClassId AND D.DeclarationYear = @DeclarationYear - 1 AND D.DeclarationStatusId = 2
				AND D.DeclarationRenewalStatusId IN (2, 3)
				--AND D.RolePlayerId = 708711
	END

	IF (@DeclarationTypeName = 'Actual And Budgeted')
	BEGIN
		INSERT INTO @ClientDeclarations (DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,
							AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,PenaltyRate,PenaltyPremium,
							Adjustment,Comment,IsDeleted, ParentOptionId, ParentRate, ChildPercentage, InsertNew)

		SELECT 2,3,1, D.RolePlayerId, D.DeclarationYear + 1, D.ProductOptionId, D.AverageEmployeeCount, (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100),
							@PenaltyPercentage, /*ISNULL(R.Rate, 0)*/ 0, (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100),-- * (@Rate / 100),
							/*ISNULL(R.Rate, 0)*/ 0 * (1 + @PenaltyPercentage/100), (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100), --* (@PenaltyRate * 0.01), 
							NULL, NULL, 0, 0, 0, 0, 0
		FROM client.Declaration D
		JOIN client.Company C ON D.RolePlayerId = C.RolePlayerID
		--JOIN client.FinPayee F ON D.RolePlayerId = F.RolePlayerId
		--LEFT JOIN client.Rates R ON F.FinPayeNumber = R.MemberNo
		WHERE C.IndustryClassId = @IndustryClassId AND D.DeclarationYear = @DeclarationYear - 1 AND D.DeclarationStatusId = 2
				AND D.DeclarationRenewalStatusId IN (2, 3)
				--AND D.RolePlayerId = 708712
	END

	IF (@DeclarationTypeName = 'Budgeted' OR @DeclarationTypeName = 'Actual And Budgeted')
	BEGIN

		INSERT INTO @ClientDeclarations (DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,
							AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,PenaltyRate,PenaltyPremium,
							Adjustment,Comment,IsDeleted, ParentOptionId, ParentRate, ChildPercentage, InsertNew)

		SELECT 2,4,1, D.RolePlayerId, D.DeclarationYear + 1, D.ProductOptionId, D.AverageEmployeeCount, (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100),
							@PenaltyPercentage, /*ISNULL(R.Rate, 0)*/ 0, (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100),-- * (@Rate / 100),
							/*ISNULL(R.Rate, 0)*/ 0 * (1 + @PenaltyPercentage/100), (D.AverageEarnings + (D.AverageEarnings * @InflationPercentage)/100), --* (@PenaltyRate * 0.01), 
							NULL, NULL, 0, 0, 0, 0, 0
		FROM client.Declaration D
		JOIN client.Company C ON D.RolePlayerId = C.RolePlayerID
		--JOIN client.FinPayee F ON D.RolePlayerId = F.RolePlayerId
		--LEFT JOIN client.Rates R ON F.FinPayeNumber = R.MemberNo
		WHERE C.IndustryClassId = @IndustryClassId AND D.DeclarationYear = @DeclarationYear - 1 AND D.DeclarationStatusId = 2
				AND D.DeclarationRenewalStatusId IN (2, 3)
				--AND D.RolePlayerId = 708712
	END
	--SELECT * FROM client.FinPayee WHERE RolePlayerId IN (136838, 136910)
	--SELECT * FROM client.Rates WHERE MemberNo IN ('RY002340', 'EM002379')
	
	-- Get Rate for Product Option if Product Option has Dependents
	UPDATE CD
	SET CD.Rate = ISNULL(R.Rate, 0),
		CD.PenaltyRate = ISNULL(R.Rate, 0) * (1 + @PenaltyPercentage/100)
	FROM @ClientDeclarations CD
	JOIN [product].[ProductOptionDependency] pd ON CD.ProductOptionId = pd.ProductOptionId AND pd.IndustryClassId = @IndustryClassId
	JOIN [product].[ProductOptionCategoryInsured] pci ON pd.ProductOptionId = pci.ProductOptionId -- potentially useless, if the same ProductOptionId has multiple CategoryInsuredIds
	JOIN [product].[ProductOption] po ON po.Id = pd.ProductOptionId
	JOIN [product].[Product] p ON po.ProductID = p.Id
	JOIN client.FinPayee F ON CD.RolePlayerId = F.RolePlayerId
	JOIN Client.Rates r ON r.Product = po.[Name] AND r.MemberNo = F.FinPayeNumber AND r.Category = pci.CategoryInsuredId
												AND COALESCE(r.RatingYear, Year(r.StartDate)) = @DeclarationYear

    -- Get Rate for Product Option if Product Option has NO Dependents
	UPDATE CD
	SET CD.Rate = ISNULL(R.Rate, 0),
		CD.PenaltyRate = ISNULL(R.Rate, 0) * (1 + @PenaltyPercentage/100)
	FROM @ClientDeclarations CD
	JOIN [product].[ProductOptionCategoryInsured] pci ON CD.ProductOptionId = pci.ProductOptionId -- potentially useless, if the same ProductOptionId has multiple CategoryInsuredIds
	JOIN [product].[ProductOption] po ON po.Id = CD.ProductOptionId
	JOIN [product].[Product] p ON po.ProductID = p.Id
	JOIN client.FinPayee F ON CD.RolePlayerId = F.RolePlayerId
	JOIN Client.Rates r ON r.Product = po.[Name] AND r.MemberNo = F.FinPayeNumber AND r.Category = pci.CategoryInsuredId
												AND COALESCE(r.RatingYear, Year(r.StartDate)) = @DeclarationYear
												AND CD.Rate = 0

    -- Get Parent Rate for Product Option if Product Option is a dependent/child of parent Product Option
	UPDATE CD
	SET CD.ParentOptionId = pd.ProductOptionId,
		CD.ParentRate = r.Rate,
		CD.ChildPercentage = pd.ChildPremiumPecentage
	FROM @ClientDeclarations CD
	JOIN [product].[ProductOptionDependency] pd ON CD.ProductOptionId = pd.ChildOptionID AND pd.IndustryClassId = @IndustryClassId
	JOIN [product].[ProductOptionCategoryInsured] pci ON pd.ProductOptionId = pci.ProductOptionId -- potentially useless, if the same ProductOptionId has multiple CategoryInsuredIds
	JOIN [product].[ProductOption] po ON po.Id = pd.ProductOptionId
	JOIN [product].[Product] p ON po.ProductID = p.Id
	JOIN client.FinPayee F ON CD.RolePlayerId = F.RolePlayerId
	JOIN Client.Rates r ON r.Product = po.[Name] AND r.MemberNo = F.FinPayeNumber AND r.Category = pci.CategoryInsuredId
												AND COALESCE(r.RatingYear, Year(r.StartDate)) = @DeclarationYear

    -- Calculate premiums for parent and stand-alone options:
	UPDATE @ClientDeclarations
	SET Premium = AverageEarnings * (Rate / 100),
		PenaltyPremium = AverageEarnings * (PenaltyRate / 100)
	WHERE ParentOptionId = 0

    -- Calculate premiums and rates for dependent/child options:
	UPDATE @ClientDeclarations
	SET Premium = AverageEarnings * (ParentRate / 100) * (ChildPercentage / 100),
		PenaltyPremium = AverageEarnings * (ParentRate / 100) * (1 + @PenaltyPercentage/100) * (ChildPercentage / 100),
		Rate = ParentRate * (ChildPercentage / 100),
		PenaltyRate = ParentRate * (1 + @PenaltyPercentage/100) * (ChildPercentage / 100)
	WHERE ParentOptionId > 0

	--SELECt * FROM @ClientDeclarations 
	--SELECT * FROM [product].[ProductOption]
	--SELECT * FROM Client.Rates
	--SELECT * FROM [product].[ProductOptionDependency]
	--SELECT * FROM [product].[ProductOptionCategoryInsured]
			
	--SELECT * FROM @ClientDeclarations
	--ORDER BY ProductOptionId, AverageEarnings

	-- Identify which declarations are not yet present in the declarations table:
	UPDATE @ClientDeclarations
	SET InsertNew = 1
	WHERE DeclarationID NOT IN (
		SELECT CD.DeclarationID 
		FROM client.Declaration d
		JOIN @ClientDeclarations CD ON 1=1 --d.DeclarationStatusId = CD.DeclarationStatusId
									AND d.DeclarationTypeId = CD.DeclarationTypeId
									--AND d.DeclarationRenewalStatusId = CD.DeclarationRenewalStatusId
									AND d.RolePlayerId = CD.RolePlayerId
									AND d.DeclarationYear = CD.DeclarationYear
									AND d.ProductOptionId = CD.ProductOptionId
	)

--	SELECt * FROM @ClientDeclarations WHERE InsertNew = 1

    -- Insert the new declarations into the declarations table:
	INSERT INTO client.Declaration (DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,
	AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,PenaltyRate,PenaltyPremium,
	Comment,Adjustment,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)

	SELECT DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,
	AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,PenaltyRate,PenaltyPremium,
	Comment,Adjustment,IsDeleted,'System',GetDate(),'System',GetDate()
	FROM @ClientDeclarations
	WHERE InsertNew = 1

    -- Update the histories to move the old current to the new history:
	Update D --client.Declaration 
	Set D.DeclarationStatusId = 4 
	FROM Client.Declaration D
	JOIN @ClientDeclarations CD ON 1=1 --d.DeclarationStatusId = CD.DeclarationStatusId
									AND d.DeclarationTypeId = CD.DeclarationTypeId
									--AND d.DeclarationRenewalStatusId = CD.DeclarationRenewalStatusId
									AND d.RolePlayerId = CD.RolePlayerId
									AND d.DeclarationYear = CD.DeclarationYear
									AND d.ProductOptionId = CD.ProductOptionId
	Where D.DeclarationTypeId = 4 AND D.DeclarationStatusId = 2 And D.DeclarationYear = @DeclarationYear -1  -- Update the Current : 2   to   History : 4

	-- Reset configuration if necessary:
	Update [Client].[DeclarationConfigurationDetail] Set EstimatesIsProcessed = 1 Where DeclarationConfigurationDetailId = @DeclarationConfigurationDetailId

	----Estimated Actual
	--IF (@DeclarationTypeName = 'Actual') 
	--	BEGIN
	--		While @RowCounter <= @NumberRecords
	--			Begin
	--				--print @InflationPercentage
	--				Select @RolePlayerId = RolePlayerId FROM @ClientCompany Where RowID = @RowCounter
	--				Select @MemberNo = FinPayeNumber From client.FinPayee where RoleplayerId = @RolePlayerId
	--				Select @Rate = Rate FROM client.Rates Where MemberNo = @MemberNo
	--				set @PenaltyRate = @Rate
	--				If(@PenaltyPercentage > 0)
	--					set @PenaltyRate = @Rate + (1 + @PenaltyPercentage/100)

	--				INSERT INTO client.Declaration (DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,
	--							PenaltyRate,PenaltyPremium,
	--							Comment,Adjustment,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)
	--				SELECT 
	--						2, --Current
	--						3, --Estimated Actual
	--						1, --Open
	--						D.RolePlayerId,
	--						--D.DeclarationYear + 1,
	--						D.DeclarationYear,
	--						D.ProductOptionId,
	--						D.AverageEmployeeCount,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) ,
	--						@PenaltyPercentage,
	--						@Rate,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) * (@Rate / 100) ,
	--						@PenaltyRate,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) * (@PenaltyRate * 0.01) ,
	--						NULL,
	--						NULL,
	--						0,
	--						'System',
	--						GetDate(),
	--						'System',
	--						GetDate()
	--				FROM client.Declaration D
	--				WHERE D.RolePlayerId = @RolePlayerId AND D.DeclarationYear = @DeclarationYear - 1 AND D.DeclarationStatusId = 2 -- History

	--				--Update client.Declaration Set DeclarationStatusId = 4 
	--				--Where RolePlayerId = @RolePlayerId AND DeclarationStatusId = 2 And DeclarationYear = @DeclarationYear -1  -- Update the Current : 2   to   History : 4
	--				Set @RowCounter = @RowCounter + 1
	--			END
	--	END

	----Estimated Budgeted
	--IF (@DeclarationTypeName = 'Budgeted') 
	--	BEGIN
	--		While @RowCounter <= @NumberRecords
	--			Begin
	--				--print @DeclarationTypeName
	--				Select @RolePlayerId = RolePlayerId FROM @ClientCompany Where RowID = @RowCounter
	--				Select @MemberNo = FinPayeNumber From client.FinPayee where RoleplayerId = @RolePlayerId
	--				Select @Rate = Rate FROM client.Rates Where MemberNo = @MemberNo
	--				set @PenaltyRate = @Rate
	--				If(@PenaltyPercentage > 0)
	--					set @PenaltyRate = @Rate + (1 + @PenaltyPercentage/100)

	--				INSERT INTO client.Declaration (DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,
	--							PenaltyRate,PenaltyPremium,
	--							Comment,Adjustment,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)
	--				SELECT 
	--						2, --Current
	--						4, --Estimated Budgeted
	--						1, --Open
	--						D.RolePlayerId,
	--						D.DeclarationYear + 1,
	--						D.ProductOptionId,
	--						D.AverageEmployeeCount,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) ,
	--						@PenaltyPercentage,
	--						@Rate,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) * (@Rate / 100) ,
	--						@PenaltyRate,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) * (@PenaltyRate * 0.01) ,
	--						NULL,
	--						NULL,
	--						0,
	--						'System',
	--						GetDate(),
	--						'System',
	--						GetDate()
	--					FROM client.Declaration D
	--					WHERE D.RolePlayerId = @RolePlayerId AND D.DeclarationYear = @DeclarationYear - 1 AND D.DeclarationStatusId = 2 -- History

	--				Update client.Declaration Set DeclarationStatusId = 4 
	--				Where RolePlayerId = @RolePlayerId AND DeclarationStatusId = 2 And DeclarationYear = @DeclarationYear -1  -- Update the Current : 2   to   History : 4
	--				Set @RowCounter = @RowCounter + 1
	--			END
	--	END

	----Actual And Budgeted
	--IF (@DeclarationTypeName = 'Actual And Budgeted') 
	--	BEGIN
	--		While @RowCounter <= @NumberRecords
	--			Begin
	--				--print @DeclarationTypeName
	--				Select @RolePlayerId = RolePlayerId FROM @ClientCompany Where RowID = @RowCounter
	--				Select @MemberNo = FinPayeNumber From client.FinPayee where RoleplayerId = @RolePlayerId
	--				Select @Rate = Rate FROM client.Rates Where MemberNo = @MemberNo
	--				set @PenaltyRate = @Rate
	--				If(@PenaltyPercentage > 0)
	--					set @PenaltyRate = @Rate + (1 + @PenaltyPercentage/100)

	--				--Actual
	--				INSERT INTO client.Declaration (DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,
	--							PenaltyRate,PenaltyPremium,
	--							Comment,Adjustment,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)
	--				SELECT 
	--						2, --Current
	--						3, --Estimated Actual
	--						1, --Open
	--						D.RolePlayerId,
	--						D.DeclarationYear + 1,
	--						D.ProductOptionId,
	--						D.AverageEmployeeCount,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) ,
	--						@PenaltyPercentage,
	--						@Rate,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) * (@Rate / 100) ,
	--						@PenaltyRate,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) * (@PenaltyRate * 0.01) ,
	--						NULL,
	--						NULL,
	--						0,
	--						'System',
	--						GetDate(),
	--						'System',
	--						GetDate()
	--					FROM client.Declaration D
	--					WHERE D.RolePlayerId = @RolePlayerId AND D.DeclarationYear = @DeclarationYear - 1 AND D.DeclarationStatusId = 2 -- Pick Current and insert for next year

	--				--Update client.Declaration Set DeclarationStatusId = 4 
	--				--Where RolePlayerId = @RolePlayerId AND DeclarationStatusId = 2 And DeclarationYear = @DeclarationYear -1  -- Update the Current : 2   to   History : 4

	--				--Budgeted
	--				INSERT INTO client.Declaration (DeclarationStatusId, DeclarationTypeId, DeclarationRenewalStatusId,RolePlayerId,DeclarationYear,ProductOptionId,AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,Premium,
	--							PenaltyRate,PenaltyPremium,
	--							Comment,Adjustment,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)
	--				SELECT 
	--						2, --Current
	--						4, --Estimated Budgeted
	--						1, --Open
	--						D.RolePlayerId,
	--						D.DeclarationYear + 1,
	--						D.ProductOptionId,
	--						D.AverageEmployeeCount,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) ,
	--						@PenaltyPercentage,
	--						@Rate,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) * (@Rate / 100) ,
	--						@PenaltyRate,
	--						(D.AverageEarnings + (D.AverageEarnings * (@InflationPercentage/100))) * (@PenaltyRate * 0.01) ,
	--						NULL,
	--						NULL,
	--						0,
	--						'System',
	--						GetDate(),
	--						'System',
	--						GetDate()
	--					FROM client.Declaration D
	--					WHERE D.RolePlayerId = @RolePlayerId AND D.DeclarationYear = @DeclarationYear - 1 AND D.DeclarationStatusId = 2 -- Pick Current one


	--				Update client.Declaration Set DeclarationStatusId = 4 
	--				Where RolePlayerId = @RolePlayerId AND DeclarationStatusId = 2 And DeclarationYear = @DeclarationYear -1  -- Update the Current : 2   to   History : 4

	--				Set @RowCounter = @RowCounter + 1
	--			END
	--	END

	--	Update [Client].[DeclarationConfigurationDetail] Set EstimatesIsProcessed = 1 Where DeclarationConfigurationDetailId = @DeclarationConfigurationDetailId
END