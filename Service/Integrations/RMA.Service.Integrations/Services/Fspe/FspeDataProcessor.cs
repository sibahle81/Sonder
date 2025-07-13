using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Integrations.AstuteFspeV2;
using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System.Collections.Generic;
using System.Linq;

using Address = RMA.Service.Integrations.Contracts.Entities.Fspe.Address;

namespace RMA.Service.Integrations.Services.Fspe
{
    public static class FspeDataProcessor
    {
        public static List<Fsp> MapFspeBrokerageData(IEnumerable<ArrayOfFSPREPPublicationResponseFSPFSP> fspResponse)
        {
            var brokerages = new List<Fsp>();
            if (fspResponse != null)
            {
                foreach (var brokerage in fspResponse)
                {
                    var broker = new Fsp
                    {
                        Name = brokerage.FSPName,
                        RegNo = brokerage.FSPRegNo,
                        FspNumber = brokerage.FSPReferenceNumber,
                        FspWebsite = brokerage.FSPWebsite,
                        CompanyType = brokerage.FSPCompanyType,
                        FinYearEnd = brokerage.FSPFinYearEnd,
                        LegalCapacity = brokerage.FSPLegalCapacity,
                        MedicalAccreditationNo = brokerage.FSPMedicalAccreditationNo,
                        Status = brokerage.FSPStatus,
                        TelNo = brokerage.FSPTelNoCode + brokerage.FSPTelNo,
                        FaxNo = brokerage.FSPFaxNoCode + brokerage.FSPFaxNo,
                        TradeName = brokerage.FSPTradeName,
                    };


                    switch (brokerage.FSPActive)
                    {
                        case YesNoType.N:
                        case YesNoType.n:
                        case YesNoType.No:
                            broker.IsActive = false;
                            break;
                        default:
                            broker.IsActive = true;
                            break;
                    }

                    broker.Categories = brokerage.Categories.Select(a => new FspLicenseCategory()
                    {
                        CategoryNo = a.CategoryNo,
                        IntermediaryDateActive = a.IntermediaryDateActive.ParseDateTimeNullable(),
                        AdviceDateActive = a.AdviceDateActive.ParseDateTimeNullable(),
                        SubCategoryNo = a.SubCategoryNo
                    }).ToList();

                    broker.Addresses = new List<Address>() {
                        new Address() {
                            AddressType = AddressTypeEnum.Physical,
                            City = brokerage.FSPAddresses.PhysicalAddress.City,
                            Line1 = brokerage.FSPAddresses.PhysicalAddress.Line1,
                            Line2 = brokerage.FSPAddresses.PhysicalAddress.Line2,
                            Code = brokerage.FSPAddresses.PhysicalAddress.Zip
                        },
                        new Address() {
                            AddressType = AddressTypeEnum.Postal,
                            City = brokerage.FSPAddresses.PostalAddress.City,
                            Line1 = brokerage.FSPAddresses.PostalAddress.Line1,
                            Line2 = brokerage.FSPAddresses.PostalAddress.Line2,
                            Code = brokerage.FSPAddresses.PostalAddress.Zip
                        }
                    };

                    broker.ComplianceOfficer = new ComplianceOfficer()
                    {
                        Name = brokerage.FSPComplianceOfficer.COName,
                        DateAppointed = brokerage.FSPComplianceOfficer.CODateAppointed,
                        PracticeName = brokerage.FSPComplianceOfficer.COPracticeName,
                        TelNo = brokerage.FSPComplianceOfficer.COTelNo
                    };

                    broker.ContactPerson = new ContactPerson()
                    {
                        Name = brokerage.FSPContactPerson.Initials,
                        Email = brokerage.FSPContactPerson.Email,
                        Surname = brokerage.FSPContactPerson.Surname,
                        Title = brokerage.FSPContactPerson.Title
                    };

                    if (brokerage.SoleProprietors != null)
                    {
                        broker.SoleProprietors = MapFspeRepsData(brokerage.SoleProprietors);
                    }
                    if (brokerage.KeyIndividuals != null)
                    {
                        broker.KeyIndividuals = MapFspeRepsData(brokerage.KeyIndividuals);
                    }
                    if (brokerage.Representatives != null)
                    {
                        broker.Representatives = MapFspeRepsData(brokerage.Representatives);
                    }

                    brokerages.Add(broker);
                }
            }

            return brokerages;
        }

        public static List<RepEntity> MapFspeRepsData(IEnumerable<RepEntity_Type> representatives)
        {
            var repEntities = new List<RepEntity>();

            if (representatives != null)
                foreach (var rep in representatives)
                {
                    var updatedRep = new RepEntity
                    {
                        FirstName = rep.FirstName,
                        SurnameOrCompanyName = rep.RepName,
                        IdNumber = rep.IDReferenceNo.Value,
                        DateOfAppointment = rep.DateOfAppointment.ParseDateTime(),
                        CountryOfRegistration = rep.CountryOfRegistration,
                        DateOfBirth = rep.DateOfBirth.ParseDateTimeNullable(),
                        Initials = rep.Initials,
                        MedicalAccreditationNo = rep.MedicalAccreditationNo,
                        Title = rep.Title,
                        PhysicalAddress = new Address()
                        {
                            AddressType = AddressTypeEnum.Physical,
                            City = rep.PhysicalAddress.City,
                            Line1 = rep.PhysicalAddress.Line1,
                            Line2 = rep.PhysicalAddress.Line2,
                            Code = rep.PhysicalAddress.Zip
                        }
                    };


                    if (rep.Categories != null)
                    {
                        updatedRep.Categories = rep.Categories.Select(a => new RepLicenseCategory()
                        {
                            AdviceDateActive = a.AdviceDateActive.ParseDateTimeNullable(),
                            CategoryNo = a.CategoryNo,
                            IntermediaryDateActive = a.IntermediaryDateActive.ParseDateTimeNullable(),
                            SubCategoryNo = a.SubCategoryNo,
                            SusDateActive = null //a.SusDateActive.ParseDateTimeNullable()
                        }).ToList();
                    }
                    if (rep.Qualifications != null)
                    {
                        updatedRep.RepQualifications = rep.Qualifications.Select(a => new RepQualification()
                        {
                            Description = a.Value,
                            QualificationCode = a.QualificationCode,
                            YearObtained = a.YearObtained
                        }).ToList();
                    }

                    switch (rep.RepType)
                    {
                        case RepType.N:
                        case RepType.n:
                            updatedRep.RepType = RepTypeEnum.Natural;
                            break;
                        case RepType.J:
                        case RepType.j:
                            updatedRep.RepType = RepTypeEnum.Juristic;
                            break;
                    }

                    switch (rep.IDReferenceNo.IDType)
                    {
                        case IDType.Id:
                        case IDType.ID:
                        case IDType.id:
                            updatedRep.IdType = IdTypeEnum.SAIDDocument;
                            break;
                        case IDType.passport:
                        case IDType.Passport:
                        case IDType.PASSPORT:
                            updatedRep.IdType = IdTypeEnum.PassportDocument;
                            break;
                        case IDType.REGNO:
                        case IDType.regno:
                        case IDType.RegNo:
                        case IDType.Regno:
                            updatedRep.IdType = IdTypeEnum.RegistrationNumber;
                            break;
                        default:
                            updatedRep.IdType = IdTypeEnum.Other;
                            break;
                    }
                    repEntities.Add(updatedRep);
                }

            return repEntities;
        }
    }
}
