namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventQuestionnaire
    {
        public int PersonEventId { get; set; } // PersonEventId (Primary key)
        public bool? IsTrainee { get; set; } // IsTrainee
        public string TraineeLocation { get; set; } // TraineeLocation (length: 100)
        public decimal? AverageEarnings { get; set; } // AverageEarnings
        public decimal? BasicRate { get; set; } // BasicRate
        public decimal? AnnualBonus { get; set; } // AnnualBonus
        public decimal? SubTotal { get; set; } // SubTotal
        public string EmployeeNumber { get; set; } // employeeNumber (length: 50)
        public string EmployeeLocation { get; set; } // employeeLocation (length: 50)
        public decimal? EmployeeAverageEarnings { get; set; } // EmployeeAverageEarnings
        public decimal? EmployeeBasicRate { get; set; } // EmployeeBasicRate
        public decimal? EmployeeAnnualBonus { get; set; } // EmployeeAnnualBonus
        public decimal? FirstHousingQuarters { get; set; } // FirstHousingQuarters
        public decimal? SecondAverageEarnings { get; set; } // SecondAverageEarnings
        public decimal? SecondBasicRate { get; set; } // SecondBasicRate
        public decimal? SecondAnnualBonus { get; set; } // SecondAnnualBonus
        public decimal? SecondHousingQuarters { get; set; } // SecondHousingQuarters
        public string SecondEmployeeNumber { get; set; } // secondEmployeeNumber (length: 50)
    }
}
