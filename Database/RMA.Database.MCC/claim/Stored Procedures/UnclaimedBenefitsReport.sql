--USE [AZD-MCC]
GO
/****** Object:  StoredProcedure [claim].[UnclaimedBenefitsReport]   
	Script Date: 7/8/2025 4:03:07 PM 
	******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Shashikant Pawar 
-- Create date: 2025-07-08
-- Description:	Unclaimed Benefits Report
-- =============================================
CREATE OR ALTER PROCEDURE [claim].[UnclaimedBenefitsReport]
    @StartDate AS DATE,
	@EndDate AS DATE
AS
BEGIN
	SELECT DISTINCT
			clm.ClaimReferenceNumber	AS [Claim Number],
			''							AS Beneficiary,
			clm.CreatedDate				AS [Claim Date],
			clm.ClaimStatusChangeDate	AS [Status Change Date],
			'1990-01-01'				AS [Payment Date To Unclaimed Bank Acc],
			0							AS [Benefit Amount],
			0							AS [Total Interest Accrued],
			0							AS [Tracing Fee],
			'1990-01-01'				AS [Benefit Payout Date],
			0							AS [Benefit Payout Amount]
		FROM 
			[claim].[Claim] (NOLOCK) clm 
		WHERE
			clm.CreatedDate BETWEEN @StartDate AND @EndDate AND
			clm.ClaimStatusId IN (20)
END