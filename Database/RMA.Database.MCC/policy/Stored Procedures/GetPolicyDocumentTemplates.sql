CREATE PROCEDURE policy.GetPolicyDocumentTemplates
	@policyNumber varchar(64)
AS BEGIN
	declare @parentPolicyId int
	declare @productId int
	declare @productOptionId int
	declare @productClassId int
	declare @rolePlayerIdentificationTypeId int

	select @parentPolicyId = p.ParentPolicyId,
		@productId = pr.Id,
		@productOptionId = p.ProductOptionId,
		@productClassId = pr.ProductClassId,
		@rolePlayerIdentificationTypeId = rp.RolePlayerIdentificationTypeId
	from policy.Policy p (nolock)
		inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
		inner join product.ProductOption po (nolock) on po.Id = p.ProductOptionId
		inner join product.Product pr (nolock) on pr.Id = po.ProductId
	where p.PolicyNumber = @policyNumber

	if (@rolePlayerIdentificationTypeId = 2 and @productId in (1, 2)) begin
		-- For group scheme parent funeral policies there is currently only one document format, 
		-- and we cannot save these in the product.ProductOptionSetting table because it is 
		-- accross all product options
		select p.PolicyId,
			p.PolicyNumber,
			rp.RolePlayerId,
			rp.RolePlayerIdentificationTypeId [RolePlayerIdentificationType],
			rp.DisplayName [MemberName],
			p.PolicyNumber [IdNumber],
			st.Id [SettingType],
			case st.Id
				when 1 then 'RMAFuneralGroupWelcomeLetter'
				when 2 then 'RMAFuneralGroupPolicySchedule'
				when 3 then 'RMAFuneralPolicyGroupTermsAndConditions.pdf'
			end [SettingValue],
			19 [DocumentSet],
			case st.Id
				when 1 then 99
				when 2 then 102
				when 3 then 38
			end [DocumentType]
		from common.SettingType st (nolock), policy.Policy p (nolock)
			inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
		where p.PolicyNumber = @policyNumber
		  and rp.RolePlayerIdentificationTypeId = 2
		  and st.Id in (1, 2, 3)
		order by st.Id
	end else if exists (select * from product.ProductOptionSetting (nolock) where ProductOptionId = @productOptionId and SettingCategoryId = 1) begin
		-- If the templates for the product option is stored in the common.ProductOptionSetting 
		-- table, use those. This is the preferred option going forward
		select p.PolicyId,
			p.PolicyNumber,
			rp.RolePlayerId,
			rp.RolePlayerIdentificationTypeId [RolePlayerIdentificationType],
			rp.DisplayName [MemberName],
			per.IdNumber,
			ps.SettingTypeId [SettingType],
			ps.[Value] [SettingValue],
			18 [DocumentSet],
			case ps.SettingTypeId
				when 1 then 99
				when 2 then 100
				when 3 then 38
			end [DocumentType]
		from policy.Policy p (nolock) 
			inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join product.ProductOptionSetting ps (nolock) on ps.ProductOptionId = p.ProductOptionId
			left join client.Person per (nolock) on per.RolePlayerId = p.PolicyOwnerId
		where p.PolicyNumber = @policyNumber
		  and ps.SettingCategoryId = 1
		  and ps.IsDeleted = 0
		order by ps.SettingTypeId
	end else if (@parentPolicyId is not null) begin
		-- Group scheme child policy
		select p.PolicyId,
			p.PolicyNumber,
			rp.RolePlayerId,
			rp.RolePlayerIdentificationTypeId [RolePlayerIdentificationType],
			rp.DisplayName [MemberName],
			per.IdNumber,
			st.Id [SettingType],
			case st.Id
				when 1 then 'RMAFuneralWelcomeLetter'
				when 2 then 'RMAGroupPolicyMemberCertificate'
				when 3 then 'RMAFuneralCoverTermsAndConditions.pdf'
			end [SettingValue],
			18 [DocumentSet],
			case st.Id
				when 1 then 99
				when 2 then 100
				when 3 then 38
			end [DocumentType]
		from common.SettingType st (nolock), policy.Policy p (nolock)
			inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join client.Person per (nolock) on per.RolePlayerId = rp.RolePlayerId
		where p.PolicyNumber = @policyNumber
		  and rp.RolePlayerIdentificationTypeId = 1
		  and st.Id in (1, 2, 3)
		order by st.Id
	end else if (@parentPolicyId is null) begin
		-- Individual policy
		select p.PolicyId,
			p.PolicyNumber,
			rp.RolePlayerId,
			rp.RolePlayerIdentificationTypeId [RolePlayerIdentificationType],
			rp.DisplayName [MemberName],
			per.IdNumber,
			st.Id [SettingType],
			case st.Id
				when 1 then 'RMAFuneralWelcomeLetter'
				when 2 then 'RMAFuneralPolicySchedule'
				when 3 then 'RMAFuneralCoverTermsAndConditions.pdf'
			end [SettingValue],
			18 [DocumentSet],
			case st.Id
				when 1 then 99
				when 2 then 100
				when 3 then 38
			end [DocumentType]
		from common.SettingType st (nolock), policy.Policy p (nolock)
			inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join client.Person per (nolock) on per.RolePlayerId = rp.RolePlayerId
		where p.PolicyNumber = @policyNumber
		  and rp.RolePlayerIdentificationTypeId = 1
		  and st.Id in (1, 2, 3)
		order by st.Id
	end else begin
		declare @msg varchar(128) = concat('The document templates for policy ',@policyNumber,' have not been defined')
		raiserror(@msg, 16, 1)
	end

END
