using AutoMapper;

using CommonServiceLocator;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace RMA.Service.ClientCare.Mappers
{
    public class BrokerMappingProfile : Profile
    {
        public BrokerMappingProfile()
        {
            CreateMap<RepEntity, broker_Representative>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.Code, opt => opt.Ignore())
                .ForMember(s => s.Email, opt => opt.Ignore())
                .ForMember(s => s.ContactNumber, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.PaymentMethod, opt => opt.Ignore())
                .ForMember(s => s.PaymentFrequency, opt => opt.Ignore())
                .ForMember(s => s.BrokerageRepresentatives, opt => opt.Ignore())
                .ForMember(s => s.BrokerageJuristicRepresentatives, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeNotes, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeFscaLicenseCategories, opt => opt.MapFrom(d => d.Categories))
                .ForMember(s => s.PhysicalAddressLine1, opt => opt.MapFrom(t => t.PhysicalAddress != null ? t.PhysicalAddress.Line1 : string.Empty))
                .ForMember(s => s.PhysicalAddressLine2, opt => opt.MapFrom(t => t.PhysicalAddress != null ? t.PhysicalAddress.Line2 : string.Empty))
                .ForMember(s => s.PhysicalAddressCity, opt => opt.MapFrom(t => t.PhysicalAddress != null ? t.PhysicalAddress.City : string.Empty))
                .ForMember(s => s.PhysicalAddressCode, opt => opt.MapFrom(t => t.PhysicalAddress != null ? t.PhysicalAddress.Code : string.Empty))
                .ForMember(s => s.RepresentativeChecks, opt => opt.Ignore())
                .ForMember(s => s.Policies_JuristicRepresentativeId, opt => opt.Ignore())
                .ForMember(s => s.Policies_RepresentativeId, opt => opt.Ignore())
                .ForMember(s => s.BrokerageJuristicRepresentatives, opt => opt.Ignore())
                .ForMember(s => s.BrokerageRepresentatives, opt => opt.Ignore())
                .ForMember(s => s.PolicyMovements_DestinationRepId, opt => opt.Ignore())
                .ForMember(s => s.PolicyMovements_SourceRepId, opt => opt.Ignore())
                .ForMember(s => s.PolicyBrokers_JuristicRepId, opt => opt.Ignore())
                .ForMember(s => s.PolicyBrokers_RepId, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeBankAccounts, opt => opt.Ignore())
                .ForMember(s => s.RolePlayers, opt => opt.Ignore());


            CreateMap<RepEntity, Representative>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.Code, opt => opt.Ignore())
                .ForMember(s => s.Email, opt => opt.Ignore())
                .ForMember(s => s.ContactNumber, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.BrokerageRepresentatives, opt => opt.Ignore())
                .ForMember(s => s.ActiveBrokerage, opt => opt.Ignore())
                .ForMember(s => s.Qualifications, opt => opt.MapFrom(t => t.RepQualifications))
                .ForMember(s => s.RepresentativeNotes, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeChecks, opt => opt.Ignore())
                .ForMember(s => s.PaymentMethod, opt => opt.Ignore())
                .ForMember(s => s.PaymentFrequency, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeBankAccounts, opt => opt.Ignore());

            CreateMap<Fsp, broker_Brokerage>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.Code, opt => opt.Ignore())
                .ForMember(s => s.StartDate, opt => opt.Ignore())
                .ForMember(s => s.EndDate, opt => opt.Ignore())
                .ForMember(s => s.PaymentMethod, opt => opt.Ignore())
                .ForMember(s => s.PaymentFrequency, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.BrokerageAddresses, opt => opt.MapFrom(item => item.Addresses))
                .ForMember(s => s.BrokerageBankAccounts, opt => opt.Ignore())
                .ForMember(s => s.PolicyBrokers, opt => opt.Ignore())
                .ForMember(s => s.BrokerageBrokerConsultants, opt => opt.Ignore())
                .ForMember(s => s.BrokerageBranch, opt => opt.Ignore())
                .ForMember(s => s.BrokerPartnership, opt => opt.Ignore())
                .ForMember(s => s.BrokerageType, opt => opt.Ignore())
                .ForMember(s => s.VatRegistrationNumber, opt => opt.Ignore())
                .ForMember(s => s.FicaVerified, opt => opt.Ignore())
                .ForMember(s => s.FicaRiskRating, opt => opt.Ignore())
                .ForMember(s => s.BrokerageContacts, opt => opt.MapFrom(n => new List<broker_BrokerageContact>() {
                    new broker_BrokerageContact() {
                        FirstName = n.ContactPerson.Name,
                        ContactType = ContactTypeEnum.BrokerContact,
                        Email = n.ContactPerson.Email,
                        LastName = n.ContactPerson.Surname,
                        TelephoneNumber = n.ContactPerson.ContactNumber
                     },
                    new broker_BrokerageContact() {
                        FirstName = n.ComplianceOfficer.Name,
                        ContactType = ContactTypeEnum.BrokerComplianceOfficer,
                        LastName = n.ComplianceOfficer.PracticeName,
                        TelephoneNumber = n.ComplianceOfficer.TelNo
                    }}))
                .ForMember(s => s.BrokerageFscaLicenseCategories, opt => opt.MapFrom(item => item.Categories))
                .ForMember(s => s.BrokerageNotes, opt => opt.Ignore())
                .ForMember(s => s.BrokerageRepresentatives, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeFscaLicenseCategories, opt => opt.Ignore())
                .ForMember(s => s.BrokerageProductOptions, opt => opt.Ignore())
                .ForMember(s => s.BrokerageChecks, opt => opt.Ignore())
                .ForMember(s => s.IsAuthorised, opt => opt.Ignore())
                .ForMember(s => s.Policies, opt => opt.Ignore())
                .ForMember(s => s.PolicyMovements_DestinationBrokerageId, opt => opt.Ignore())
                .ForMember(s => s.PolicyMovements_SourceBrokerageId, opt => opt.Ignore())
                .ForMember(s => s.PolicyBrokers, opt => opt.Ignore())
                .ForMember(s => s.OnboardAdminFee, opt => opt.Ignore())
                .ForMember(s => s.OnboardPercentageShare, opt => opt.Ignore())
                .ForMember(s => s.PolicyBinders, opt => opt.Ignore())
                .ForMember(s => s.OrganisationOptionItemValues, opt => opt.Ignore());

            CreateMap<Address, broker_BrokerageAddress>()
                .ForMember(s => s.AddressLine1, opt => opt.MapFrom(d => d.Line1))
                .ForMember(s => s.AddressLine2, opt => opt.MapFrom(d => d.Line2))
                .ForMember(s => s.PostalCode, opt => opt.MapFrom(d => d.Code))
                .ForMember(s => s.City, opt => opt.MapFrom(d => d.City))
                .ForMember(s => s.AddressType, opt => opt.MapFrom(d => d.AddressType))
                .ForMember(s => s.CountryId, opt => opt.MapFrom(d => 1))
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.BrokerageId, opt => opt.Ignore())
                .ForMember(s => s.Province, opt => opt.Ignore())
                .ForMember(s => s.Brokerage, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore());

            CreateMap<FspLicenseCategory, broker_BrokerageFscaLicenseCategory>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.FscaLicenseCategoryId, opt => opt.MapFrom(d => GetLicenseCategoryId(d.CategoryNo, d.SubCategoryNo)))
                .ForMember(s => s.FscaLicenseCategory, opt => opt.Ignore())
                .ForMember(s => s.BrokerageId, opt => opt.Ignore())
                .ForMember(s => s.Brokerage, opt => opt.Ignore());

            CreateMap<RepLicenseCategory, broker_RepresentativeFscaLicenseCategory>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.FscaLicenseCategoryId, opt => opt.MapFrom(d => GetLicenseCategoryId(d.CategoryNo, d.SubCategoryNo)))
                .ForMember(s => s.FscaLicenseCategory, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeId, opt => opt.Ignore())
                .ForMember(s => s.Representative, opt => opt.Ignore())
                .ForMember(s => s.BrokerageId, opt => opt.Ignore())
                .ForMember(s => s.Brokerage, opt => opt.Ignore());

            CreateMap<RepQualification, broker_RepQualification>()
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.Representative, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeId, opt => opt.Ignore())
                .ForMember(s => s.Code, opt => opt.MapFrom(d => d.QualificationCode));

            CreateMap<User, BrokerConsultant>()
                .ForMember(s => s.BrokerageId, opt => opt.Ignore());

            CreateMap<broker_Brokerage, Brokerage>()
                .ForMember(s => s.Contacts, opt => opt.MapFrom(d => d.BrokerageContacts))
                .ForMember(s => s.Addresses, opt => opt.MapFrom(d => d.BrokerageAddresses))
                .ForMember(s => s.Categories, opt => opt.MapFrom(d => d.BrokerageFscaLicenseCategories))
                .ForMember(s => s.SoleProprietors, opt => opt.MapFrom(r => GetReps(r.BrokerageRepresentatives, RepRoleEnum.SoleProprietor)))
                .ForMember(s => s.KeyIndividuals, opt => opt.MapFrom(r => GetReps(r.BrokerageRepresentatives, RepRoleEnum.KeyIndividual)))
                .ForMember(s => s.Representatives, opt => opt.MapFrom(r => GetReps(r.BrokerageRepresentatives, RepRoleEnum.Representative)))
                .ForMember(s => s.BrokerageBrokerConsultants, opt => opt.MapFrom(d => GetBrokeragesConsultants(d.BrokerageBrokerConsultants)))
                .ForMember(s => s.BrokerageBrokerConsultantIds, opt => opt.MapFrom(d => d.BrokerageBrokerConsultants == null ? new List<int>() : d.BrokerageBrokerConsultants.Select(c => c.UserId)))
                .ForMember(s => s.BrokerageProductOptions, opt => opt.MapFrom(d => d.BrokerageProductOptions))
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(s => s.StatusText, opt => opt.Ignore())
                .ForMember(s => s.BrokerPartnership, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.BrokerageBranch, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_Brokerage>(s.Id));

            CreateMap<broker_BrokerageContact, BrokerageContact>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_BrokerageContact>(s.Id));

            CreateMap<broker_BrokerageAddress, BrokerageAddress>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_BrokerageAddress>(s.Id));

            CreateMap<broker_BrokerageFscaLicenseCategory, BrokerageLicenseCategory>()
                .ForMember(s => s.CategoryNo, opt => opt.MapFrom(d => d.FscaLicenseCategory.CategoryNo))
                .ForMember(s => s.SubCategoryNo, opt => opt.MapFrom(d => d.FscaLicenseCategory.SubCategoryNo))
                .ForMember(s => s.ProductClass, opt => opt.MapFrom(d => d.FscaLicenseCategory.ProductClass))
                .ForMember(s => s.ProductClassText, opt => opt.Ignore())
                .ForMember(s => s.Description, opt => opt.MapFrom(d => d.FscaLicenseCategory.Description))
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_BrokerageFscaLicenseCategory>(s.Id));

            CreateMap<broker_BrokerageBankAccount, BrokerageBankAccount>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_BrokerageBankAccount>(s.Id));

            CreateMap<broker_RepresentativeBankAccount, RepresentativeBankAccount>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_RepresentativeBankAccount>(s.Id));

            CreateMap<broker_Representative, Representative>()
                .ForMember(s => s.PhysicalAddress, opt => opt.MapFrom(d => new Address()
                {
                    Code = d.PhysicalAddressCode,
                    City = d.PhysicalAddressCity,
                    AddressType = AddressTypeEnum.Physical,
                    Line1 = d.PhysicalAddressLine1,
                    Line2 = d.PhysicalAddressLine2
                }))
                .ForMember(s => s.Categories, opt => opt.MapFrom(r => r.RepresentativeFscaLicenseCategories))
                .ForMember(s => s.Qualifications, opt => opt.MapFrom(r => r.RepQualifications))
                .ForMember(s => s.ActiveBrokerage, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_Representative>(s.Id));

            CreateMap<broker_BrokerageRepresentative, BrokerageRepresentative>()
                .ReverseMap()
                .ForMember(s => s.StartDate, opt => opt.MapFrom(d => d.StartDate.ToSaDateTime()))
                .ForMember(s => s.EndDate, opt => opt.MapFrom(d => d.EndDate.ToSaDateTime()))
                .ForMember(s => s.JuristicRepId, opt => opt.MapFrom(d => d.JuristicRepId == 0 ? null : d.JuristicRepId))
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_BrokerageRepresentative>(s.Id));

            CreateMap<broker_RepresentativeFscaLicenseCategory, RepresentativeLicenseCategory>()
                .ForMember(s => s.FspNumber, opt => opt.MapFrom(d => d.Brokerage.FspNumber))
                .ForMember(s => s.CategoryNo, opt => opt.MapFrom(d => d.FscaLicenseCategory.CategoryNo))
                .ForMember(s => s.SubCategoryNo, opt => opt.MapFrom(d => d.FscaLicenseCategory.SubCategoryNo))
                .ForMember(s => s.ProductClass, opt => opt.MapFrom(d => d.FscaLicenseCategory.ProductClass))
                .ForMember(s => s.Description, opt => opt.MapFrom(d => d.FscaLicenseCategory.Description))
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_RepresentativeFscaLicenseCategory>(s.Id));

            CreateMap<broker_RepQualification, RepresentativeQualification>()
                .ForMember(s => s.QualificationCode, opt => opt.MapFrom(d => d.Code))
                .ReverseMap()
                .ForMember(s => s.Code, opt => opt.MapFrom(d => d.QualificationCode))
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_RepQualification>(s.Id));

            CreateMap<broker_BrokerageNote, Note>()
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.BrokerageId))
                .ReverseMap()
                .ForMember(t => t.BrokerageId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_BrokerageNote>(s.Id));

            CreateMap<broker_BrokerageBrokerConsultant, BrokerConsultant>()
                .ForMember(s => s.Email, opt => opt.Ignore())
                .ForMember(s => s.DisplayName, opt => opt.Ignore())
                .ForMember(s => s.TelNo, opt => opt.Ignore())
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ForMember(t => t.Id, opt => opt.MapFrom(s => s.UserId))
                .ForMember(s => s.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(t => t.UserId, opt => opt.MapFrom(s => s.Id));

            CreateMap<broker_BrokerageCheck, ValidityCheck>()
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.BrokerageId))
                .ReverseMap()
                .ForMember(t => t.BrokerageId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsingServiceLocator();

            CreateMap<broker_RepresentativeCheck, ValidityCheck>()
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.RepresentativeId))
                .ReverseMap()
                .ForMember(t => t.RepresentativeId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsingServiceLocator();

            CreateMap<broker_RepresentativeNote, Note>()
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.RepresentativeId))
                .ReverseMap()
                .ForMember(t => t.RepresentativeId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<broker_RepresentativeNote>(s.Id));

            CreateMap<broker_BrokerageProductOption, BrokerageProductOption>()
                 .ReverseMap()
                 .ForMember(s => s.Brokerage, opt => opt.Ignore())
                 .ConstructUsing(s => MapperExtensions.GetEntity<broker_BrokerageProductOption>(s.Id));

            CreateMap<broker_Brokerage, BrokerageModel>()
                .ForMember(s => s.Representatives, opt => opt.MapFrom(r => GetReps(r.BrokerageRepresentatives, RepRoleEnum.Representative)))
                .ReverseMap();

            CreateMap<RepresentativeModel, Representative>()
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.CreatedBy, opt => opt.Ignore())
                .ForMember(s => s.CreatedDate, opt => opt.Ignore())
                .ForMember(s => s.ModifiedBy, opt => opt.Ignore())
                .ForMember(s => s.ModifiedDate, opt => opt.Ignore())
                .ForMember(s => s.Id, opt => opt.Ignore())
                .ForMember(s => s.IdType, opt => opt.Ignore())
                .ForMember(s => s.RepType, opt => opt.Ignore())
                .ForMember(s => s.CountryOfRegistration, opt => opt.Ignore())
                .ForMember(s => s.DateOfBirth, opt => opt.Ignore())
                .ForMember(s => s.MedicalAccreditationNo, opt => opt.Ignore())
                .ForMember(s => s.PhysicalAddress, opt => opt.Ignore())
                .ForMember(s => s.Categories, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeBankAccounts, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeNotes, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeChecks, opt => opt.Ignore())
                .ForMember(s => s.Qualifications, opt => opt.Ignore())
                .ForMember(s => s.BrokerageRepresentatives, opt => opt.Ignore())
                .ForMember(s => s.PaymentMethod, opt => opt.Ignore())
                .ForMember(s => s.ActiveBrokerage, opt => opt.Ignore())
                .ForMember(s => s.PaymentFrequency, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<broker_BrokerPartnership, BrokerPartnership>()
           .ForMember(s => s.Brokerage, opt => opt.Ignore())
           .ReverseMap();
        }

        private static List<broker_FscaLicenseCategory> _categories;
        private readonly SemaphoreSlim _locker = new SemaphoreSlim(1, 1);
        private static List<User> _consultants;
        private static List<RepEntity> _reps;
        private static List<ProductOption> _productOptions;

        private int GetLicenseCategoryId(int categoryCode, int subCategoryCode)
        {
            _locker.Wait();

            try
            {
                if (_categories == null)
                {
                    var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                    var repository = ServiceLocator.Current.GetInstance<IRepository<broker_FscaLicenseCategory>>();
                    using (factory.CreateReadOnly())
                    {
                        _categories = repository.ToList();
                    }
                }
            }
            finally
            {
                _locker.Release();
            }

            return _categories.Where(r => r.CategoryNo == categoryCode && r.SubCategoryNo == subCategoryCode).Select(d => d.Id).Single();
        }

        private List<BrokerConsultant> GetBrokeragesConsultants(ICollection<broker_BrokerageBrokerConsultant> consultants)
        {
            var brokerConsultants = new List<BrokerConsultant>();
            _locker.Wait();
            try
            {
                if (consultants.Count > 0)
                {
                    var userService = ServiceLocator.Current.GetInstance<IUserService>();
                    _consultants = userService.GetUsersByUserIds(consultants.Select(c => c.UserId).ToList()).Result;
                    if (_consultants != null)
                    {
                        _consultants.ForEach(c => brokerConsultants.Add(new BrokerConsultant { Id = c.Id, Email = c.Email, DisplayName = c.DisplayName }));
                    }
                }
            }
            finally
            {
                _locker.Release();
            }
            return brokerConsultants;
        }

        private List<Representative> GetReps(ICollection<broker_BrokerageRepresentative> representativesList, RepRoleEnum role)
        {
            var representatives = new List<Representative>();
            if (representativesList == null)
            {
                return representatives;
            }
            var repSpecific = representativesList.Where(a => a.RepRole == role && a.Representative != null).ToList();
            _locker.Wait();
            try
            {

                if (repSpecific.Count > 0)
                {
                    //var repService = ServiceLocator.Current.GetInstance<IRepresentativeService>();

                    foreach (var rep in repSpecific)
                    {
                        var mapRep = Mapper.Map<Representative>(rep.Representative);
                        representatives.Add(mapRep);
                    }

                }
            }
            finally
            {
                _locker.Release();
            }
            return representatives;
        }

    }
}
