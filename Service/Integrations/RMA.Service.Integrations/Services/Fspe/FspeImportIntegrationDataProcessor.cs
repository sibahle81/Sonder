using RMA.Service.Integrations.Contracts.Entities.Fspe;
using RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration;

using System.Collections.Generic;

namespace RMA.Service.Integrations.Services.Fspe
{
    public static class FspeImportIntegrationDataProcessor
    {
        public static List<Fsp> MapFspeBrokerageData(List<FSP> fsps)
        {
            var brokerages = new List<Fsp>();
            if (fsps != null)
            {
                foreach (var fsp in fsps)
                {
                    var broker = new Fsp
                    {
                        Name = fsp.FspName
                        //RegNo = fsp.FSPRegNo,
                        //FspNumber = fsp.FSPReferenceNumber,
                        //FspWebsite = fsp.FSPWebsite,
                        //CompanyType = fsp.FSPCompanyType,
                        //FinYearEnd = fsp.FSPFinYearEnd,
                        //LegalCapacity = fsp.FSPLegalCapacity,
                        //MedicalAccreditationNo = fsp.FSPMedicalAccreditationNo,
                        //Status = fsp.FSPStatus,
                        //TelNo = fsp.FSPTelNoCode + fsp.FSPTelNo,
                        //FaxNo = fsp.FSPFaxNoCode + fsp.FSPFaxNo,
                        //TradeName = fsp.FSPTradeName,
                    };


                    /*switch (fsp.FSPActive)
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

                    broker.Categories = fsp.Categories.Select(a => new FspLicenseCategory()
                    {
                        CategoryNo = a.CategoryNo,
                        IntermediaryDateActive = a.IntermediaryDateActive.ParseDateTimeNullable(),
                        AdviceDateActive = a.AdviceDateActive.ParseDateTimeNullable(),
                        SubCategoryNo = a.SubCategoryNo
                    }).ToList();

                    broker.Addresses = new List<Address>() {
                        new Address() {
                            AddressType = AddressTypeEnum.Physical,
                            City = fsp.FSPAddresses.PhysicalAddress.City,
                            Line1 = fsp.FSPAddresses.PhysicalAddress.Line1,
                            Line2 = fsp.FSPAddresses.PhysicalAddress.Line2,
                            Code = fsp.FSPAddresses.PhysicalAddress.Zip
                        },
                        new Address() {
                            AddressType = AddressTypeEnum.Postal,
                            City = fsp.FSPAddresses.PostalAddress.City,
                            Line1 = fsp.FSPAddresses.PostalAddress.Line1,
                            Line2 = fsp.FSPAddresses.PostalAddress.Line2,
                            Code = fsp.FSPAddresses.PostalAddress.Zip
                        }
                    };

                    broker.ComplianceOfficer = new ComplianceOfficer()
                    {
                        Name = fsp.FSPComplianceOfficer.COName,
                        DateAppointed = fsp.FSPComplianceOfficer.CODateAppointed,
                        PracticeName = fsp.FSPComplianceOfficer.COPracticeName,
                        TelNo = fsp.FSPComplianceOfficer.COTelNo
                    };

                    broker.ContactPerson = new ContactPerson()
                    {
                        Name = fsp.FSPContactPerson.Initials,
                        Email = fsp.FSPContactPerson.Email,
                        Surname = fsp.FSPContactPerson.Surname,
                        Title = fsp.FSPContactPerson.Title
                    };

                    if (fsp.SoleProprietors != null)
                    {
                        broker.SoleProprietors = MapFspeRepsData(fsp.SoleProprietors);
                    }
                    if (fsp.KeyIndividuals != null)
                    {
                        broker.KeyIndividuals = MapFspeRepsData(fsp.KeyIndividuals);
                    }
                    if (fsp.Representatives != null)
                    {
                        broker.Representatives = MapFspeRepsData(fsp.Representatives);
                    }*/

                    brokerages.Add(broker);
                }
            }

            return brokerages;
        }

        public static List<RepEntity> MapFspeRepsData(List<Representative> representatives)
        {
            var repEntities = new List<RepEntity>();

            if (representatives != null)
                foreach (var rep in representatives)
                {
                    var updatedRep = new RepEntity
                    {
                        FirstName = rep.Name,
                        //SurnameOrCompanyName = rep.RepName,
                        //IdNumber = rep.IDReferenceNo.Value,
                        //DateOfAppointment = rep.DateOfAppointment.ParseDateTime(),
                        //CountryOfRegistration = rep.CountryOfRegistration,
                        //DateOfBirth = rep.DateOfBirth.ParseDateTimeNullable(),
                        //Initials = rep.Initials,
                        //MedicalAccreditationNo = rep.MedicalAccreditationNo,
                        //Title = rep.Title,
                        //PhysicalAddress = new Address()
                        //{
                        //    AddressType = AddressTypeEnum.Physical,
                        //    City = rep.PhysicalAddress.City,
                        //    Line1 = rep.PhysicalAddress.Line1,
                        //    Line2 = rep.PhysicalAddress.Line2,
                        //    Code = rep.PhysicalAddress.Zip
                        //}
                    };

                    /*
                    if (rep.Products != null)
                    {
                        updatedRep.Categories = rep.Products.fore.Select(a => new RepLicenseCategory()
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
                    }*/
                    repEntities.Add(updatedRep);
                }

            return repEntities;
        }

    }
}