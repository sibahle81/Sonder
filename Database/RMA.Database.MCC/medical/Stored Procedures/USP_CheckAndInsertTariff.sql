CREATE PROCEDURE [medical].[USP_CheckAndInsertTariff]
	@ItemCode VARCHAR(50),
	@CCTariffId INT, --CompCareTariffId
    @PractitionerTypeId INT,
	@ServiceDate DATETIME
AS
BEGIN

DECLARE @TariffTypeId INT

SELECT TOP 1 @TariffTypeId = T.TariffTypeID 
FROM [medical].[TariffCC] T (NOLOCK) WHERE T.TariffID = @CCTariffId

IF NOT EXISTS (SELECT TOP 1 1 FROM [medical].[Tariff] T WITH(NOLOCK)
				INNER JOIN [medical].[TariffType] TT WITH(NOLOCK) ON TT.TariffTypeID = T.TariffTypeID
				INNER JOIN [medical].[MedicalItem] MI WITH(NOLOCK) ON MI.MedicalItemID = T.MedicalitemID
				INNER JOIN [medical].[TariffBaseUnitCost] TBUC WITH(NOLOCK) ON TBUC.TariffBaseUnitCostID = T.TariffBaseUnitCostID
				WHERE T.ItemCode = @ItemCode
				AND @ServiceDate BETWEEN T.ValidFrom AND T.ValidTo
				AND T.PractitionerTypeId = @PractitionerTypeId
				AND T.TariffTypeId = @TariffTypeId AND T.IsDeleted = 0)
	BEGIN

	-- Tariff doesn't exist on Modernisation, get data from CompCare and insert the Tariff on Modernisation

		DECLARE @ValidFrom DATETIME,  @ValidTo DATETIME,  @TariffBaseUnitCostId INT,  @TariffBaseUnitCostName VARCHAR(2000),
			@RecommendedUnits DECIMAL(10,2),  @VatCodeId INT,  @MedicalItemTypeId INT, @MedicalItemId INT,  
			@SectionId INT,  @IsCopiedFromNRPL INT,  @UnitPrice  DECIMAL(10,2)

		SELECT TOP 1  
			 @ValidFrom = T.ValidFrom
			,@ValidTo = T.ValidTo
			,@TariffBaseUnitCostName = TBUC.[Name]
			,@RecommendedUnits = T.RecommendedUnits
			,@VatCodeId = T.VatCodeId --VatCodeId is same on CompCare
			,@MedicalItemTypeId = MI.MedicalItemTypeId
			,@SectionId = T.SectionId
			,@IsCopiedFromNRPL = T.IsCopiedFromNRPL
		FROM [medical].[TariffCC] T WITH(NOLOCK)
		INNER JOIN [medical].[TariffTypeCC] TT WITH(NOLOCK) ON TT.TariffTypeID = T.TariffTypeID
		INNER JOIN [medical].[MedicalItemCC] MI WITH(NOLOCK) ON MI.MedicalItemID = T.MedicalitemID
		INNER JOIN [medical].[TariffBaseUnitCostCC] TBUC WITH(NOLOCK) ON TBUC.TariffBaseUnitCostID = T.TariffBaseUnitCostID
		WHERE T.TariffID = @CCTariffId
		AND T.ItemCode = @ItemCode

		SELECT TOP 1 @TariffBaseUnitCostId = TariffBaseUnitCostId, @UnitPrice = UnitPrice
		FROM [medical].[TariffBaseUnitCost] where [Name] = @TariffBaseUnitCostName
		AND @ServiceDate BETWEEN ValidFrom AND ValidTo
		AND TariffTypeId = @TariffTypeId

		SELECT TOP 1 @MedicalItemId = MedicalItemId 
		FROM [medical].[MedicalItem] WHERE RTRIM(LTRIM([Itemcode])) = @ItemCode 
		AND MedicalItemTypeId = @MedicalItemTypeId AND IsDeleted = 0

		IF (ISNULL(@MedicalItemId, 0) = 0)
		BEGIN

			DECLARE @Name VARCHAR(50),
			@Description VARCHAR(2048),
			@DefaultQuantity DECIMAL(10,2),
			@AcuteMedicalAuthNeededTypeId INT,
			@ChronicMedicalAuthNeededTypeId INT,
			@IsAllowSameDayTreatment BIT,
			@PublicationId INT,
			@EffectiveFrom DATETIME,
			@EffectiveTo DATETIME

			SELECT TOP 1 @ItemCode = ItemCode,
			@Name = Name,
			@Description = Description,
			@MedicalItemTypeId = MedicalItemTypeID,
			@DefaultQuantity = DefaultQuantity,
			@AcuteMedicalAuthNeededTypeId = AcuteMedicalAuthNeededTypeID,
			@ChronicMedicalAuthNeededTypeId = ChronicMedicalAuthNeededTypeID,
			@IsAllowSameDayTreatment = IsAllowSameDayTreatment,
			@PublicationId = PublicationID
			FROM [medical].[MedicalItemCC]
			WHERE RTRIM(LTRIM([Itemcode])) = @ItemCode 
			AND IsActive = 1
			
			INSERT INTO [medical].[MedicalItem]
				([ItemCode]
				,[Name]
				,[Description]
				,[MedicalItemTypeId]
				,[TreatmentCodeId]
				,[NAPPICodeId]
				,[IsActive]
				,[DefaultQuantity]
				,[AcuteMedicalAuthNeededTypeId]
				,[ChronicMedicalAuthNeededTypeId]
				,[IsAllowSameDayTreatment]
				,[PublicationId]
				,[EffectiveFrom]
				,[EffectiveTo]
				,[IsDeleted]
				,[CreatedBy]
				,[CreatedDate]
				,[ModifiedBy]
				,[ModifiedDate])
			VALUES
				(@ItemCode
				,@Name
				,@Description
				,@MedicalItemTypeId
				,0
				,0
				,1
				,@DefaultQuantity
				,@AcuteMedicalAuthNeededTypeId
				,@ChronicMedicalAuthNeededTypeId
				,@IsAllowSameDayTreatment
				,@PublicationId
				,@EffectiveFrom
				,@EffectiveTo
				,0
				,'BackendUser'
				,GETDATE()
				,'BackendUser'
				,GETDATE())

			SELECT TOP 1 @MedicalItemId = MedicalItemId 
			FROM [medical].[MedicalItem] WHERE RTRIM(LTRIM([Itemcode])) = @ItemCode 
			AND MedicalItemTypeId = @MedicalItemTypeId AND IsDeleted = 0

		END

		IF (@MedicalItemId > 0 AND @TariffBaseUnitCostId > 0)
		BEGIN
			INSERT INTO [medical].[Tariff]
			   ([ItemCode]
			   ,[ValidFrom]
			   ,[ValidTo]
			   ,[TariffBaseUnitCostId]
			   ,[RecommendedUnits]
			   ,[VatCodeId]
			   ,[PractitionerTypeId]
			   ,[TariffTypeId]
			   ,[MedicalItemId]
			   ,[SectionId]
			   ,[IsCopiedFromNRPL]
			   ,[IsDeleted]
			   ,[CreatedBy]
			   ,[CreatedDate]
			   ,[ModifiedBy]
			   ,[ModifiedDate])
			VALUES
			   (@ItemCode
			   ,@ValidFrom
			   ,@ValidTo
			   ,@TariffBaseUnitCostId
			   ,@RecommendedUnits
			   ,@VatCodeId
			   ,@PractitionerTypeId
			   ,@TariffTypeId
			   ,@MedicalItemId
			   ,@SectionId
			   ,@IsCopiedFromNRPL
			   ,0
			   ,'BackendUser'
			   ,GETDATE()
			   ,'BackendUser'
			   ,GETDATE())
		END

	END

	--Return Tariff from Modernisation
	SELECT TOP 1  T.TariffID, T.ItemCode, 
		MI.Description, MI.MedicalItemId, 
		T.RecommendedUnits * TBUC.UnitPrice AS TariffAmount, 
		T.TariffTypeID, T.ItemCode AS TariffCode
	FROM [medical].[Tariff] T WITH(NOLOCK)
	INNER JOIN [medical].[TariffType] TT WITH(NOLOCK) ON TT.TariffTypeID = T.TariffTypeID
	INNER JOIN [medical].[MedicalItem] MI WITH(NOLOCK) ON MI.MedicalItemID = T.MedicalitemID
	INNER JOIN [medical].[TariffBaseUnitCost] TBUC WITH(NOLOCK) ON TBUC.TariffBaseUnitCostID = T.TariffBaseUnitCostID
	WHERE T.ItemCode = @ItemCode
	AND @ServiceDate BETWEEN T.ValidFrom AND T.ValidTo
	AND T.PractitionerTypeId = @PractitionerTypeId
	AND T.TariffTypeId = @TariffTypeId
	AND T.IsDeleted = 0

END

