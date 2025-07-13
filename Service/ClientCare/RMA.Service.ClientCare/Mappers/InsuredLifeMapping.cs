using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class InsuredLifeMapping : CsvMapping<Load_InsuredLife>
    {
        public InsuredLifeMapping()
        {
            this.MapProperty(0, s => s.MemberNumber);
            this.MapProperty(1, s => s.Passport);
            this.MapProperty(2, s => s.IdNumber);
            this.MapProperty(3, s => s.FirstName);
            this.MapProperty(4, s => s.Surname);
            this.MapProperty(5, s => s.Gender);
            this.MapProperty(6, s => s.Nationality);
            this.MapProperty(7, s => s.CellNumber);
            this.MapProperty(8, s => s.HomeAddress);
            this.MapProperty(9, s => s.PostalCode);
            this.MapProperty(10, s => s.PostalAddress);
            this.MapProperty(11, s => s.Code);
            this.MapProperty(12, s => s.Province);
            this.MapProperty(13, s => s.EmployeeNumber);
            this.MapProperty(14, s => s.EmploymentDate);
            this.MapProperty(15, s => s.Occupation);
            this.MapProperty(16, s => s.AnnualEarnings);
        }
    }
}
