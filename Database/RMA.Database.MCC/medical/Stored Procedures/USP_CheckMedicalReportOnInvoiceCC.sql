CREATE PROCEDURE [medical].[USP_CheckMedicalReportOnInvoiceCC]
	--@CompCareMedicalInvoiceID INT
	@PersonEventID INT,
	@MedicalServiceProviderID INT,
	@TreatmentDateFrom DATETIME,
	@PrevUnderAssessReasonID INT
AS
BEGIN
	DECLARE @PractitionerTypeId INT, @IsMedReportFound BIT = 1, @IsMSPRequireMedReport BIT= 0,
	 @DaysToleranceMedReport INT = 30, --Based on current CompCare Tolerance for checking medical report
	 @UnderAssessReasonID INT = 0
	--DECLARE @CompCareMedicalInvoiceID INT = 3546258

	--DECLARE @PersonEventID INT, @MedicalServiceProviderID INT, @TreatmentDateFrom DATETIME, 
	-- @PractitionerTypeId INT, @IsMedReportFound BIT = 1, @IsMSPRequireMedReport BIT= 0,
	-- @DaysToleranceMedReport INT = 30, --Based on current CompCare Tolerance for checking medical report
	-- @PrevUnderAssessReasonID INT, @UnderAssessReasonID INT = 0

	--SELECT TOP 1 @PersonEventID = PersonEventID,
	--@MedicalServiceProviderID = MedicalServiceProviderID,
	--@TreatmentDateFrom = DateAdmitted,
	--@PrevUnderAssessReasonID = UnderAssessReasonID
	--FROM Compensation.MedicalInvoice
	--WHERE MedicalInvoiceID = @CompCareMedicalInvoiceID

	SELECT  @IsMSPRequireMedReport = ISNULL(pt.IsRequireMedReport, 0),
		@PractitionerTypeId = msp.PractitionerTypeID
	FROM    [medical].[MedicalServiceProviderCC] msp
		INNER JOIN [medical].[CompcarePractitionerType] pt ON pt.PractitionerTypeID = msp.PractitionerTypeID
	WHERE   msp.MedicalServiceProviderID = @MedicalServiceProviderID

	IF (@PractitionerTypeId = 21)  --MSP type is Radiology, must submit report for same day as invoice service date.
		SET @DaysToleranceMedReport = 0

	IF @IsMSPRequireMedReport = 1 
	BEGIN
		IF NOT EXISTS ( SELECT  1
						FROM    [medical].[MedicalReportCC]
						WHERE   PersonEventID = @PersonEventID
								AND MedicalServiceProviderID = @MedicalServiceProviderID
								AND ReportStatus = 2
								AND IsActive = 1 
								AND (case when TreatmentDate is null then ReportDate else TreatmentDate end )
										between DateAdd(d, (@DaysToleranceMedReport * - 1), @TreatmentDateFrom) and DateAdd(d, @DaysToleranceMedReport, @TreatmentDateFrom))
			BEGIN
				SET @IsMedReportFound = 0
			END

		IF @PrevUnderAssessReasonID = 1023 -- Medical Report Required.
			AND NOT EXISTS ( SELECT 1
								FROM   [medical].[MedicalReportCC]
								WHERE  PersonEventID = @PersonEventID
									AND ReportStatus = 2
									AND IsActive = 1 
									AND (case when TreatmentDate is null then ReportDate else TreatmentDate end )
											between DateAdd(d, (@DaysToleranceMedReport * - 1), @TreatmentDateFrom) and DateAdd(d, @DaysToleranceMedReport, @TreatmentDateFrom))
			BEGIN
				SET @UnderAssessReasonID = 1023
				SET @IsMedReportFound = 0
			END
		ELSE
			IF @PrevUnderAssessReasonID = 1038 -- Progress Medical Report Required.
				AND NOT EXISTS ( SELECT 1
									FROM   [medical].[MedicalReportCC]
									WHERE  PersonEventID = @PersonEventID
										AND ReportStatus = 2
										AND IsActive = 1
										AND MedicalReportTypeID = 2 
										AND (case when TreatmentDate is null then ReportDate else TreatmentDate end )
												between DateAdd(d, (@DaysToleranceMedReport * - 1), @TreatmentDateFrom) and DateAdd(d, @DaysToleranceMedReport, @TreatmentDateFrom))
				BEGIN
					SET @UnderAssessReasonID = 1038
					SET @IsMedReportFound = 0
				END
			ELSE
				IF @PrevUnderAssessReasonID = 1039 -- Final Medical Report Required.
					AND NOT EXISTS ( SELECT 1
										FROM   [medical].[MedicalReportCC]
										WHERE  PersonEventID = @PersonEventID
											AND ReportStatus = 2
											AND IsActive = 1
											AND MedicalReportTypeID = 3 
											AND (case when TreatmentDate is null then ReportDate else TreatmentDate end ) 
												between DateAdd(d, (@DaysToleranceMedReport * - 1), @TreatmentDateFrom) and DateAdd(d, @DaysToleranceMedReport, @TreatmentDateFrom))
					BEGIN
						SET @UnderAssessReasonID = 1039
						SET @IsMedReportFound = 0
					END
				ELSE
					IF NOT EXISTS ( SELECT  1
									FROM    [medical].[MedicalReportCC]
									WHERE   PersonEventID = @PersonEventID
											AND ReportStatus = 2
											AND IsActive = 1 
											AND (case when TreatmentDate is null then ReportDate else TreatmentDate end ) 
												between DateAdd(d, (@DaysToleranceMedReport * - 1), @TreatmentDateFrom) and DateAdd(d, @DaysToleranceMedReport, @TreatmentDateFrom))
						BEGIN
							SET @UnderAssessReasonID = 1023
							SET @IsMedReportFound = 0
						END

	END

	SELECT @IsMSPRequireMedReport AS IsMSPRequireMedReport, @IsMedReportFound AS IsMedReportFound, @UnderAssessReasonID AS UnderAssessReasonID


END
