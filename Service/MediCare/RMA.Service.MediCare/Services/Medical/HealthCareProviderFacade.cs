using AutoMapper;

using Newtonsoft.Json;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Constants;
using RMA.Service.MediCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class HealthCareProviderFacade : RemotingStatelessService, IHealthCareProviderService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_HealthCareProvider> _healthCareProviderRepository;
        private readonly IRepository<medical_HealthCareProviderAgreedTariff> _healthCareProviderAgreedTariffRepository;
        private readonly IRepository<medical_PractitionerType> _practitionerTypeRepository;
        private readonly IVatService _vatService;
        private readonly IRepository<medical_Invoice> _invoiceRepository;
        private readonly IUserService _userService;

        public HealthCareProviderFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_HealthCareProvider> healthCareProviderRepository
            , IRepository<medical_HealthCareProviderAgreedTariff> healthCareProviderAgreedTariffRepository
            , IRepository<medical_PractitionerType> practitionerTypeRepository
            , IVatService vatService
            , IRepository<medical_Invoice> invoiceRepository
            , IUserService userService)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _healthCareProviderRepository = healthCareProviderRepository;
            _healthCareProviderAgreedTariffRepository = healthCareProviderAgreedTariffRepository;
            _practitionerTypeRepository = practitionerTypeRepository;
            _vatService = vatService;
            _invoiceRepository = invoiceRepository;
            _userService = userService;
        }

        public async Task<HealthCareProvider> GetHealthCareProviderById(int rolePlayerId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewHealthCareProvider);

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                        from hcp in _healthCareProviderRepository
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        where hcp.RolePlayerId.Equals(rolePlayerId)
                        select new HealthCareProvider
                        {
                            RolePlayerId = hcp.RolePlayerId,
                            Name = hcp.Name,
                            Description = hcp.Description,
                            PracticeNumber = hcp.PracticeNumber,
                            DatePracticeStarted = hcp.DatePracticeStarted,
                            DatePracticeClosed = hcp.DatePracticeClosed,
                            ProviderTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            ConsultingPartnerType = hcp.ConsultingPartnerType,
                            IsPreferred = hcp.IsPreferred,
                            IsMedInvTreatmentInfoProvided = hcp.IsMedInvTreatmentInfoProvided,
                            IsMedInvInjuryInfoProvided = hcp.IsMedInvInjuryInfoProvided,
                            IsMineHospital = hcp.IsMineHospital,
                            IsNeedTreatments = hcp.IsNeedTreatments,
                            ArmType = hcp.ArmType,
                            ArmCode = hcp.ArmCode,
                            FinSystemSynchStatusId = hcp.FinSystemSynchStatusId,
                            HealthCareProviderGroupId = hcp.HealthCareProviderGroupId,
                            DispensingLicenseNo = hcp.DispensingLicenseNo,
                            AcuteMedicalAuthNeededTypeId = hcp.AcuteMedicalAuthNeededTypeId,
                            ChronicMedicalAuthNeededTypeId = hcp.ChronicMedicalAuthNeededTypeId,
                            IsAllowSameDayTreatment = hcp.IsAllowSameDayTreatment,
                            AgreementEndDate = hcp.AgreementEndDate,
                            AgreementStartDate = hcp.AgreementStartDate,
                            IsAuthorised = hcp.IsAuthorised,
                            AgreementType = hcp.AgreementType,
                            IsActive = hcp.IsActive,
                            IsJvPartner = hcp.IsJvPartner,
                        }).FirstOrDefaultAsync();
            }
        }

        public async Task<HealthCareProvider> SearchHealthCareProviderByPracticeNumber(string practiceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity =
                    await _healthCareProviderRepository.FirstOrDefaultAsync(p =>
                        p.PracticeNumber.ToLower().Trim() == practiceNumber.ToLower().Trim());
                return Mapper.Map<HealthCareProvider>(entity);
            }
        }

        public async Task<List<HealthCareProvider>> GetHealthCareProviders()
        {
            RmaIdentity.DemandPermission(Permissions.ViewHealthCareProvider);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                        from hcp in _healthCareProviderRepository
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        select new HealthCareProvider
                        {
                            RolePlayerId = hcp.RolePlayerId,
                            Name = hcp.Name,
                            Description = hcp.Description,
                            PracticeNumber = hcp.PracticeNumber,
                            DatePracticeStarted = hcp.DatePracticeStarted,
                            DatePracticeClosed = hcp.DatePracticeClosed,
                            ProviderTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            ConsultingPartnerType = hcp.ConsultingPartnerType,
                            IsPreferred = hcp.IsPreferred,
                            IsMedInvTreatmentInfoProvided = hcp.IsMedInvTreatmentInfoProvided,
                            IsMedInvInjuryInfoProvided = hcp.IsMedInvInjuryInfoProvided,
                            IsMineHospital = hcp.IsMineHospital,
                            IsNeedTreatments = hcp.IsNeedTreatments,
                            ArmType = hcp.ArmType,
                            ArmCode = hcp.ArmCode,
                            FinSystemSynchStatusId = hcp.FinSystemSynchStatusId,
                            HealthCareProviderGroupId = hcp.HealthCareProviderGroupId,
                            DispensingLicenseNo = hcp.DispensingLicenseNo,
                            AcuteMedicalAuthNeededTypeId = hcp.AcuteMedicalAuthNeededTypeId,
                            ChronicMedicalAuthNeededTypeId = hcp.ChronicMedicalAuthNeededTypeId,
                            IsAllowSameDayTreatment = hcp.IsAllowSameDayTreatment,
                            AgreementEndDate = hcp.AgreementEndDate,
                            AgreementStartDate = hcp.AgreementStartDate,
                            IsAuthorised = hcp.IsAuthorised,
                            AgreementType = hcp.AgreementType,
                            IsJvPartner = hcp.IsJvPartner,
                        }).ToListAsync();
            }
        }

        public async Task<List<HealthCareProvider>> GetJvHealthCareProviders()
        {
            RmaIdentity.DemandPermission(Permissions.ViewHealthCareProvider);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                    from hcp in _healthCareProviderRepository
                    join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                    where hcp.IsJvPartner == true
                    select new HealthCareProvider
                    {
                        RolePlayerId = hcp.RolePlayerId,
                        Name = hcp.Name,
                        Description = hcp.Description,
                        PracticeNumber = hcp.PracticeNumber,
                        DatePracticeStarted = hcp.DatePracticeStarted,
                        DatePracticeClosed = hcp.DatePracticeClosed,
                        ProviderTypeId = hcp.ProviderTypeId,
                        PractitionerTypeName = pt.Name,
                        IsVat = hcp.IsVat,
                        VatRegNumber = hcp.VatRegNumber,
                        ConsultingPartnerType = hcp.ConsultingPartnerType,
                        IsPreferred = hcp.IsPreferred,
                        IsMedInvTreatmentInfoProvided = hcp.IsMedInvTreatmentInfoProvided,
                        IsMedInvInjuryInfoProvided = hcp.IsMedInvInjuryInfoProvided,
                        IsMineHospital = hcp.IsMineHospital,
                        IsNeedTreatments = hcp.IsNeedTreatments,
                        ArmType = hcp.ArmType,
                        ArmCode = hcp.ArmCode,
                        FinSystemSynchStatusId = hcp.FinSystemSynchStatusId,
                        HealthCareProviderGroupId = hcp.HealthCareProviderGroupId,
                        DispensingLicenseNo = hcp.DispensingLicenseNo,
                        AcuteMedicalAuthNeededTypeId = hcp.AcuteMedicalAuthNeededTypeId,
                        ChronicMedicalAuthNeededTypeId = hcp.ChronicMedicalAuthNeededTypeId,
                        IsAllowSameDayTreatment = hcp.IsAllowSameDayTreatment,
                        AgreementEndDate = hcp.AgreementEndDate,
                        AgreementStartDate = hcp.AgreementStartDate,
                        IsAuthorised = hcp.IsAuthorised,
                        AgreementType = hcp.AgreementType,
                        IsJvPartner = hcp.IsJvPartner,
                    }).ToListAsync();
            }
        }


        public async Task<int> AddHealthCareProvider(HealthCareProvider healthCareProvider)
        {
            RmaIdentity.DemandPermission(Permissions.CreateHealthCareProvider);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_HealthCareProvider>(healthCareProvider);
                _healthCareProviderRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.RolePlayerId;
            }
        }

        public async Task<int> EditHealthCareProvider(HealthCareProvider healthCareProvider)
        {
            RmaIdentity.DemandPermission(Permissions.EditHealthCareProvider);

            if (healthCareProvider == null) return 0;

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _healthCareProviderRepository.FirstOrDefaultAsync(a => a.RolePlayerId == healthCareProvider.RolePlayerId);

                entity.Name = healthCareProvider.Name;
                entity.Description = healthCareProvider.Description;
                entity.PracticeNumber = healthCareProvider.PracticeNumber;
                entity.DatePracticeStarted = healthCareProvider.DatePracticeStarted;
                entity.DatePracticeClosed = healthCareProvider.DatePracticeClosed;
                entity.ProviderTypeId = healthCareProvider.ProviderTypeId;
                entity.IsVat = healthCareProvider.IsVat;
                entity.VatRegNumber = healthCareProvider.VatRegNumber;
                entity.ConsultingPartnerType = healthCareProvider.ConsultingPartnerType;
                entity.IsPreferred = healthCareProvider.IsPreferred;
                entity.IsMedInvTreatmentInfoProvided = healthCareProvider.IsMedInvTreatmentInfoProvided;
                entity.IsMedInvInjuryInfoProvided = healthCareProvider.IsMedInvInjuryInfoProvided;
                entity.IsMineHospital = healthCareProvider.IsMineHospital;
                entity.IsNeedTreatments = healthCareProvider.IsNeedTreatments;
                entity.ArmType = healthCareProvider.ArmType;
                entity.ArmCode = healthCareProvider.ArmCode;
                entity.FinSystemSynchStatusId = healthCareProvider.FinSystemSynchStatusId;
                entity.HealthCareProviderGroupId = healthCareProvider.HealthCareProviderGroupId;
                entity.DispensingLicenseNo = healthCareProvider.DispensingLicenseNo;
                entity.AcuteMedicalAuthNeededTypeId = healthCareProvider.AcuteMedicalAuthNeededTypeId;
                entity.ChronicMedicalAuthNeededTypeId = healthCareProvider.ChronicMedicalAuthNeededTypeId;
                entity.IsAllowSameDayTreatment = healthCareProvider.IsAllowSameDayTreatment;
                entity.AgreementEndDate = healthCareProvider.AgreementEndDate;
                entity.AgreementStartDate = healthCareProvider.AgreementStartDate;
                entity.IsAuthorised = healthCareProvider.IsAuthorised;
                entity.AgreementType = healthCareProvider.AgreementType;
                entity.IsActive = healthCareProvider.IsActive;
                entity.IsDeleted = healthCareProvider.IsDeleted;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;
                entity.IsJvPartner = healthCareProvider.IsJvPartner;

                _healthCareProviderRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.RolePlayerId;
            }
        }

        public async Task<List<HealthCareProvider>> FilterHealthCareProviders(string searchString)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {

                return await (
                        from hcp in _healthCareProviderRepository
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        where (hcp.Name.Contains(searchString) || hcp.PracticeNumber.Contains(searchString))
                        select new HealthCareProvider
                        {
                            RolePlayerId = hcp.RolePlayerId,
                            Name = hcp.Name,
                            Description = hcp.Description,
                            PracticeNumber = hcp.PracticeNumber,
                            DatePracticeStarted = hcp.DatePracticeStarted,
                            DatePracticeClosed = hcp.DatePracticeClosed,
                            ProviderTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            ConsultingPartnerType = hcp.ConsultingPartnerType,
                            IsPreferred = hcp.IsPreferred,
                            IsMedInvTreatmentInfoProvided = hcp.IsMedInvTreatmentInfoProvided,
                            IsMedInvInjuryInfoProvided = hcp.IsMedInvInjuryInfoProvided,
                            IsMineHospital = hcp.IsMineHospital,
                            IsNeedTreatments = hcp.IsNeedTreatments,
                            ArmType = hcp.ArmType,
                            ArmCode = hcp.ArmCode,
                            FinSystemSynchStatusId = hcp.FinSystemSynchStatusId,
                            HealthCareProviderGroupId = hcp.HealthCareProviderGroupId,
                            DispensingLicenseNo = hcp.DispensingLicenseNo,
                            AcuteMedicalAuthNeededTypeId = hcp.AcuteMedicalAuthNeededTypeId,
                            ChronicMedicalAuthNeededTypeId = hcp.ChronicMedicalAuthNeededTypeId,
                            IsAllowSameDayTreatment = hcp.IsAllowSameDayTreatment,
                            AgreementEndDate = hcp.AgreementEndDate,
                            AgreementStartDate = hcp.AgreementStartDate,
                            IsAuthorised = hcp.IsAuthorised,
                            AgreementType = hcp.AgreementType,
                            IsJvPartner = hcp.IsJvPartner,
                            IsHospital = pt.IsHospital,
                        }).ToListAsync();
            }
        }

        public async Task<bool> IsHcpHospital(string searchString)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await (
                    from hcp in _healthCareProviderRepository
                    join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                    where ((hcp.Name.Contains(searchString) || hcp.PracticeNumber.Contains(searchString)) && pt.IsHospital)
                    select hcp
                ).AnyAsync();
            }
        }

        public async Task<PagedRequestResult<HealthCareProvider>> SearchHealthCareProvidersForInvoiceReports(PagedRequest request)
        {
            if (request == null) return new PagedRequestResult<HealthCareProvider>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceSearch = JsonConvert.DeserializeObject<InvoiceSearchModel>(request?.SearchCriteria);
                var invoiceResult = _invoiceRepository.Where(i => i.InvoiceDate >= invoiceSearch.StartDate && i.InvoiceDate < invoiceSearch.EndDate).Select(i => i);

                var practiceNumber = String.IsNullOrEmpty(invoiceSearch.PracticeNumber) ? null : invoiceSearch.PracticeNumber;//name

                var healthCareProviderSearchResult = await (
                    from i in invoiceResult
                    join hcp in _healthCareProviderRepository on i.HealthCareProviderId equals hcp.RolePlayerId
                    where practiceNumber == null || hcp.PracticeNumber == practiceNumber
                    select new HealthCareProvider
                    {
                        RolePlayerId = hcp.RolePlayerId,
                        Name = hcp.Name,
                        Description = hcp.Description,
                        PracticeNumber = hcp.PracticeNumber
                    }).Distinct().ToPagedResult(request);

                return new PagedRequestResult<HealthCareProvider>
                {
                    Page = healthCareProviderSearchResult.Page,
                    PageCount = healthCareProviderSearchResult.PageCount,
                    RowCount = healthCareProviderSearchResult.RowCount,
                    PageSize = healthCareProviderSearchResult.PageSize,
                    Data = healthCareProviderSearchResult.Data
                };
            }
        }

        public async Task<PagedRequestResult<HealthCareProvider>> SearchHealthCareProviders(PagedRequest request)
        {

            if (request == null) return new PagedRequestResult<HealthCareProvider>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (request?.OrderBy.ToLower() == "HealthCareProviderId") request.OrderBy = "HealthCareProviderId";

                var healthCareProviderSearch = JsonConvert.DeserializeObject<HealthCareProvider>(request?.SearchCriteria);

                healthCareProviderSearch.Name = healthCareProviderSearch.Name.TrimWithNull();
                healthCareProviderSearch.PracticeNumber = healthCareProviderSearch.PracticeNumber.TrimWithNull();

                var healthCareProviders = await _healthCareProviderRepository
                    .Where(a => ((string.IsNullOrEmpty(healthCareProviderSearch.Name) ? a.Name != null : a.Name.Contains(healthCareProviderSearch.Name))
                      || (string.IsNullOrEmpty(healthCareProviderSearch.PracticeNumber) ? a.PracticeNumber != null : a.PracticeNumber.Contains(healthCareProviderSearch.PracticeNumber)))
                    && (healthCareProviderSearch.ProviderTypeId == 0 ? a.ProviderTypeId > 0 : a.ProviderTypeId.Equals(healthCareProviderSearch.ProviderTypeId)))
                    .ToPagedResult(request);

                if (healthCareProviders.Data.Count > 0)
                {
                    var returnResult = new PagedRequestResult<HealthCareProvider>
                    {
                        Page = healthCareProviders.Page,
                        PageCount = healthCareProviders.PageCount,
                        RowCount = healthCareProviders.RowCount,
                        PageSize = healthCareProviders.PageSize,
                        Data = new List<HealthCareProvider>()
                    };

                    var mappedhealthCareProvider = Mapper.Map<List<HealthCareProvider>>(healthCareProviders.Data);

                    var results = (from hcp in mappedhealthCareProvider
                                   join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                                   select new HealthCareProvider
                                   {
                                       RolePlayerId = hcp.RolePlayerId,
                                       Name = hcp.Name,
                                       Description = hcp.Description,
                                       PracticeNumber = hcp.PracticeNumber,
                                       DatePracticeStarted = hcp.DatePracticeStarted,
                                       DatePracticeClosed = hcp.DatePracticeClosed,
                                       ProviderTypeId = hcp.ProviderTypeId,
                                       PractitionerTypeName = pt.Name,
                                       IsVat = hcp.IsVat,
                                       VatRegNumber = hcp.VatRegNumber,
                                       ConsultingPartnerType = hcp.ConsultingPartnerType,
                                       IsPreferred = hcp.IsPreferred,
                                       IsMedInvTreatmentInfoProvided = hcp.IsMedInvTreatmentInfoProvided,
                                       IsMedInvInjuryInfoProvided = hcp.IsMedInvInjuryInfoProvided,
                                       IsMineHospital = hcp.IsMineHospital,
                                       IsNeedTreatments = hcp.IsNeedTreatments,
                                       ArmType = hcp.ArmType,
                                       ArmCode = hcp.ArmCode,
                                       FinSystemSynchStatusId = hcp.FinSystemSynchStatusId,
                                       HealthCareProviderGroupId = hcp.HealthCareProviderGroupId,
                                       DispensingLicenseNo = hcp.DispensingLicenseNo,
                                       AcuteMedicalAuthNeededTypeId = hcp.AcuteMedicalAuthNeededTypeId,
                                       ChronicMedicalAuthNeededTypeId = hcp.ChronicMedicalAuthNeededTypeId,
                                       IsAllowSameDayTreatment = hcp.IsAllowSameDayTreatment,
                                       AgreementEndDate = hcp.AgreementEndDate,
                                       AgreementStartDate = hcp.AgreementStartDate,
                                       IsAuthorised = hcp.IsAuthorised,
                                       AgreementType = hcp.AgreementType,
                                       IsJvPartner = hcp.IsJvPartner,
                                   }
                                  ).ToList();

                    foreach (var item in results)
                    {
                        returnResult.Data.Add(item);
                    }

                    return returnResult;
                }
            }

            return new PagedRequestResult<HealthCareProvider>();
        }

        public async Task<int> GetHealthCareProviderAgreedTariff(int healthCareProviderId, bool isChronic, DateTime serviceDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _healthCareProviderAgreedTariffRepository.FirstOrDefaultAsync(x => x.HealthCareProviderId == healthCareProviderId
                        && x.IsChronic == isChronic && x.ValidFrom <= serviceDate && x.ValidTo >= serviceDate);

                if (entities != null)
                {
                    return entities.TariffTypeId;
                }
                else
                {
                    return 0;
                }
            }
        }

        public async Task<string> GetHealthCareProviderAgreedTariffTypeIds(int healthCareProviderId, bool isChronic, DateTime serviceDate)
        {
            string sTariffTypeIds = "";
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _healthCareProviderAgreedTariffRepository.Where(x => x.HealthCareProviderId == healthCareProviderId
                        && x.IsChronic == isChronic && x.ValidFrom <= serviceDate && x.ValidTo >= serviceDate).ToListAsync();

                if (entities != null)
                {
                    foreach (var e in entities)
                    {
                        sTariffTypeIds = sTariffTypeIds + e.TariffTypeId.ToString() + ",";
                    }
                    if (sTariffTypeIds.Length > 0)
                        sTariffTypeIds = sTariffTypeIds.Remove(sTariffTypeIds.Length - 1, 1);
                }
                return sTariffTypeIds;
            }
        }

        public async Task<decimal> GetHealthCareProviderVatAmount(bool isVatRegistered, DateTime invoiceDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (isVatRegistered)
                    return await _vatService.GetVatAmount((int)VatCodeEnum.StandardVATRate, invoiceDate);
                else
                    return await _vatService.GetVatAmount((int)VatCodeEnum.VATExempt, invoiceDate);
            }
        }

        public async Task<bool> IsRequireMedicalReport(int rolePlayerId)
        {
            var isMedicalReportRequired = false;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var practitionerTypeEntity = await (from hcp in _healthCareProviderRepository
                                                    join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                                                    where hcp.RolePlayerId == rolePlayerId && pt.IsRequireMedicalReport == true
                                                    select pt).FirstOrDefaultAsync();

                isMedicalReportRequired = Convert.ToBoolean(practitionerTypeEntity?.IsRequireMedicalReport);
            }
            return isMedicalReportRequired;
        }

        public async Task<HealthCareProvider> GetHealthCareProviderByIdForSTPIntegration(int healthCareProviderId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = {
                    new SqlParameter("HealthCareProviderId", healthCareProviderId)
                };

                var healthCareProvider = await _healthCareProviderRepository.SqlQueryAsync<HealthCareProvider>(DatabaseConstants.GetHealthCareProviderByIdForSTPIntegration, parameters);
                return healthCareProvider.FirstOrDefault();
            }
        }

        public async Task<List<HealthCareProvider>> FilterHealthCareProvidersLinkedToExternalUser(string searchString)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var user = await _userService.GetUserByEmail(RmaIdentity.Email);
                var healthCareProviderIds = new List<int>();
                if (!user.IsInternalUser)
                {
                    var userHealthCareProviderDetails = await _userService.GetHealthCareProvidersLinkedToUser(RmaIdentity.Email);
                    healthCareProviderIds.AddRange(userHealthCareProviderDetails.Select(userHealthCareProvider => userHealthCareProvider.HealthCareProviderId));
                }

                return await (
                        from hcp in _healthCareProviderRepository
                        join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                        where (hcp.Name.Contains(searchString) || hcp.PracticeNumber.Contains(searchString))
                        && (user.IsInternalUser
                                   || healthCareProviderIds.Any(healthCareProviderId => healthCareProviderId == hcp.RolePlayerId))
                        select new HealthCareProvider
                        {
                            RolePlayerId = hcp.RolePlayerId,
                            Name = hcp.Name,
                            Description = hcp.Description,
                            PracticeNumber = hcp.PracticeNumber,
                            DatePracticeStarted = hcp.DatePracticeStarted,
                            DatePracticeClosed = hcp.DatePracticeClosed,
                            ProviderTypeId = hcp.ProviderTypeId,
                            PractitionerTypeName = pt.Name,
                            IsVat = hcp.IsVat,
                            VatRegNumber = hcp.VatRegNumber,
                            ConsultingPartnerType = hcp.ConsultingPartnerType,
                            IsPreferred = hcp.IsPreferred,
                            IsMedInvTreatmentInfoProvided = hcp.IsMedInvTreatmentInfoProvided,
                            IsMedInvInjuryInfoProvided = hcp.IsMedInvInjuryInfoProvided,
                            IsMineHospital = hcp.IsMineHospital,
                            IsNeedTreatments = hcp.IsNeedTreatments,
                            ArmType = hcp.ArmType,
                            ArmCode = hcp.ArmCode,
                            FinSystemSynchStatusId = hcp.FinSystemSynchStatusId,
                            HealthCareProviderGroupId = hcp.HealthCareProviderGroupId,
                            DispensingLicenseNo = hcp.DispensingLicenseNo,
                            AcuteMedicalAuthNeededTypeId = hcp.AcuteMedicalAuthNeededTypeId,
                            ChronicMedicalAuthNeededTypeId = hcp.ChronicMedicalAuthNeededTypeId,
                            IsAllowSameDayTreatment = hcp.IsAllowSameDayTreatment,
                            AgreementEndDate = hcp.AgreementEndDate,
                            AgreementStartDate = hcp.AgreementStartDate,
                            IsAuthorised = hcp.IsAuthorised,
                            AgreementType = hcp.AgreementType,
                            IsJvPartner = hcp.IsJvPartner,
                        }).ToListAsync();
            }
        }

        public async Task<PagedRequestResult<HealthCareProvider>> GetPagedHealthCareProviders(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var query = Convert.ToString(pagedRequest.SearchCriteria);
                var healthCareProviders = await (from hcp in _healthCareProviderRepository
                                                 join pt in _practitionerTypeRepository on hcp.ProviderTypeId equals pt.PractitionerTypeId
                                                 where hcp.RolePlayerId.Equals(hcp.RolePlayerId)
                                                 where hcp.Name.Contains(query)
                                                 || hcp.PracticeNumber.Contains(query)
                                                 select new HealthCareProvider
                                                 {
                                                     RolePlayerId = hcp.RolePlayerId,
                                                     Name = hcp.Name,
                                                     Description = hcp.Description,
                                                     PracticeNumber = hcp.PracticeNumber,
                                                     DatePracticeStarted = hcp.DatePracticeStarted,
                                                     DatePracticeClosed = hcp.DatePracticeClosed,
                                                     ProviderTypeId = hcp.ProviderTypeId,
                                                     PractitionerTypeName = pt.Name,
                                                     IsVat = hcp.IsVat,
                                                     VatRegNumber = hcp.VatRegNumber,
                                                     ConsultingPartnerType = hcp.ConsultingPartnerType,
                                                     IsPreferred = hcp.IsPreferred,
                                                     IsMedInvTreatmentInfoProvided = hcp.IsMedInvTreatmentInfoProvided,
                                                     IsMedInvInjuryInfoProvided = hcp.IsMedInvInjuryInfoProvided,
                                                     IsMineHospital = hcp.IsMineHospital,
                                                     IsNeedTreatments = hcp.IsNeedTreatments,
                                                     ArmType = hcp.ArmType,
                                                     ArmCode = hcp.ArmCode,
                                                     FinSystemSynchStatusId = hcp.FinSystemSynchStatusId,
                                                     HealthCareProviderGroupId = hcp.HealthCareProviderGroupId,
                                                     DispensingLicenseNo = hcp.DispensingLicenseNo,
                                                     AcuteMedicalAuthNeededTypeId = hcp.AcuteMedicalAuthNeededTypeId,
                                                     ChronicMedicalAuthNeededTypeId = hcp.ChronicMedicalAuthNeededTypeId,
                                                     IsAllowSameDayTreatment = hcp.IsAllowSameDayTreatment,
                                                     AgreementEndDate = hcp.AgreementEndDate,
                                                     AgreementStartDate = hcp.AgreementStartDate,
                                                     IsAuthorised = hcp.IsAuthorised,
                                                     AgreementType = hcp.AgreementType,
                                                     IsJvPartner = hcp.IsJvPartner,
                                                 }
                    ).ToPagedResult(pagedRequest);

                return new PagedRequestResult<HealthCareProvider>
                {
                    Data = healthCareProviders.Data,
                    RowCount = healthCareProviders.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(healthCareProviders.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }
    }
}
