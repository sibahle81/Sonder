-- =============================================
-- Author:      Ludwig Nel
-- Create Date: 2019-03-26
-- Description: Perform Commission Run
-- =============================================
CREATE PROCEDURE [policy].[RunCommission]
(
    @period VARCHAR(6), 
	@user VARCHAR(50), 
	@startDate DATETIME, 
	@endDate DATETIME
)
AS
BEGIN
    
    SET NOCOUNT ON

	-- Delete existing commissions for the period
	delete w from [policy].[CommissionHeader] h
		inner join [policy].[CommissionSummary] s on s.[CommissionHeaderId] = h.[Id]
		inner join [policy].[CommissionDetail] d on d.[CommissionSummaryId] = s.[Id]
		inner join [policy].[CommissionWithholding] w on w.[CommissionDetailId] = d.[Id]
	where h.[Period] = @period

	delete d from [policy].[CommissionHeader] h
		inner join [policy].[CommissionSummary] s on s.[CommissionHeaderId] = h.[Id]
		inner join [policy].[CommissionDetail] d on d.[CommissionSummaryId] = s.[Id]
	where h.[Period] = @period

	delete s from [policy].[CommissionHeader] h
		inner join [policy].[CommissionSummary] s on s.[CommissionHeaderId] = h.[Id]
	where h.[Period] = @period

	delete h from [policy].[CommissionHeader] h where h.[Period] = @period
 
	-- Insert a new Commission Header
	DECLARE @commissionHeaderId INT
	INSERT INTO policy.CommissionHeader(Period, ExportDate, IsActive, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate) VALUES (@period, NULL, 1, 0, @user, GETDATE(), @user, GETDATE())
	set @commissionHeaderId = @@IDENTITY


	--Commission Summary
	INSERT INTO policy.CommissionSummary(CommissionHeaderId, BrokerageId, BrokerageName, BankAccountId, NumberOfPolicies, Commission, IsActive, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, StatusId, [Status])
	SELECT @commissionHeaderId [CommissionHeaderId], 
		[brokerage].[Id] [BrokerageId], 
		[brokerage].[Name] [BrokerageName], 
		ISNULL([bankAccount].[Id],0) [BankAccountId], 
		COUNT([policy].Id) [PolicyCount],
		ROUND(SUM(policy.PayablePremium * (policy.CommissionPercentage / 100.0)) 
			- SUM((policy.PayablePremium * (policy.CommissionPercentage / 100.0)) 
				* (isnull(broker.DefaultCommissionPercentageWithholding, 0.0) / 100.0)), 2) [Commission],
		1 [IsActive], 
		0 [IsDeleted], 
		@user [CreatedBy], 
		GETDATE() [CreatedDate], 
		@user [ModifiedBy], 
		GETDATE() [ModifiedDate],
		1 [StatusId],
		'Not Submitted' [Status]
	FROM [client].[Brokerage] [brokerage]
		INNER JOIN [client].[Broker] [broker]  ON [brokerage].[Id] = [broker].[BrokerageId]
				AND [broker].[IsActive] = 1
		INNER JOIN [policy].[Policy] [policy]  ON [broker].[Id] = [policy].[BrokerId]
			AND [policy].[IsActive] = 1
			AND [policy].[CommissionPercentage] > 0
		INNER JOIN [policy].[ClientCover] [clientCover] ON [policy].[Id] = [clientCover].[PolicyId]
			AND [clientCover].[IsActive] = 1
		INNER JOIN [billing].[AllocatedPayment] [payment] ON [clientCover].[Id] = [payment].[ClientCoverId]
			AND [payment].[IsActive] = 1
		LEFT JOIN [client].[BankAccount] [bankAccount] ON [brokerage].[BankAccountId] = [bankAccount].[Id]
			AND [bankAccount].[IsActive] = 1
	WHERE [brokerage].[IsActive] = 1
	GROUP BY [brokerage].[Id], 
		[brokerage].[Name], 
		[bankAccount].[Id]
	
	--Commission Detail
	INSERT INTO policy.CommissionDetail(CommissionSummaryId, PolicyId, PolicyNumber, ClientId, ClientName, ClientReference, BrokerId, BrokerName, JoinDate, PaidForMonth, Premium, CommissionPercentage, CommissionAmount, RetentionPercentage, RetentionAmount, Clawback, ExportDate, IsActive, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
	SELECT distinct summary.Id [CommissionSummaryId],
		policy.Id [PolicyId], 
		TRIM(policy.POlicyNumber) [PolicyNumber], 
		client.Id [ClientId], 
		TRIM(CONCAT(client.Name, ' ', client.LastName)) [ClientName],
		client.ReferenceNumber [ClientReference], 
		broker.Id [BrokerId], 
		TRIM(Broker.Name) [BrokerName], 	 
		policy.InceptionDate [JoinDate],
		FORMAT(@endDate, 'MMMM yyyy') [PaidForMonth],
		ROUND(policy.PayablePremium, 2) [Premium],
		ROUND(policy.CommissionPercentage, 2) [CommissionPercentage],
		ROUND(policy.PayablePremium * (policy.CommissionPercentage / 100.0), 2) [CommissionAmount],
		ROUND(ISNULL(broker.DefaultCommissionPercentageWithholding, 0.0), 2) [RetentionPercentage],
		ROUND((policy.PayablePremium * (policy.CommissionPercentage / 100.0)) * (isnull(broker.DefaultCommissionPercentageWithholding, 0.0) / 100.0), 2) [RetentionAmount],
		CASE
			WHEN (SELECT COUNT(*) FROM billing.UnmetPayment unmet  
				INNER JOIN finance.BankStatementEntries import  ON unmet.BankImportId = import.Id
					AND TRIM(concat(import.UserReference1, import.UserReference2)) = TRIM(client.ReferenceNumber)
					AND unmet.IsActive = 1
					AND unmet.CreatedDate >= @startDate
					AND unmet.CreatedDate <= @endDate) > 0 
			THEN
				ROUND(policy.PayablePremium * (policy.CommissionPercentage / 100.0), 2)	
			ELSE	
				0.00		
		END [ClawBack], 
		NULL [ExportDate],
		1 [IsActive], 
		0 [IsDeleted], 
		@user [CreatedBy], 
		GETDATE() [CreatedDate], 
		@user [ModifiedBy], 
		GETDATE() [ModifiedDate]
	FROM policy.CommissionSummary summary WITH(NOLOCK)
		INNER JOIN client.Brokerage brokerage ON summary.BrokerageId = brokerage.Id
			AND brokerage.IsActive = 1
		INNER JOIN client.Broker broker ON brokerage.Id = broker.BrokerageId
			AND broker.IsActive = 1
		INNER JOIN policy.Policy policy ON broker.Id = policy.BrokerId
			AND policy.IsActive = 1
			AND policy.CommissionPercentage > 0
		INNER JOIN client.Client client ON policy.ClientId = client.Id
			AND client.IsActive = 1
		INNER JOIN policy.ClientCover clientCover ON policy.Id = clientCover.PolicyId
			AND clientCover.ClientId = client.Id
			AND clientCover.IsActive = 1
		LEFT JOIN billing.AllocatedPayment payment ON clientCover.Id = payment.ClientCoverId
			AND payment.IsActive = 1
	WHERE summary.CommissionHeaderId = @commissionHeaderID
		AND summary.IsActive = 1

	--Commission Withholding
	INSERT INTO policy.CommissionWithholding(CommissionDetailId, Period, PolicyId, PolicyNumber, ClientId, ClientName, ClientReference, BrokerId, BrokerName, WithholdingPercentage, WithholdingAmount, PaidDate, IsActive, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
	SELECT detail.Id [CommissionDetailId], 
		@period [Period], 
		PolicyId, 
		PolicyNumber, 
		ClientId, 
		ClientName, 
		ClientReference, 
		BrokerId, 
		BrokerName, 
		RetentionPercentage [WithholdingPercentage],
		RetentionAmount [WithholdingAmount],	
		NULL [PaidDate],
		1 [IsActive], 
		0 [IsDeleted], 
		@user [CreatedBy], 
		GETDATE() [CreatedDate], 
		@user [ModifiedBy], 
		GETDATE() [ModifiedDate]
	FROM policy.CommissionDetail detail  
		INNER JOIN policy.CommissionSummary summary ON detail.CommissionSummaryId = summary.Id
		INNER JOIN policy.CommissionHeader header ON summary.CommissionHeaderId = header.Id
	WHERE header.Period = @period
		AND detail.RetentionAmount > 0
END
