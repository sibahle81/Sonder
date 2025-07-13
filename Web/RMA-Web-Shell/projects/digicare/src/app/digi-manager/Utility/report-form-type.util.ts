export class ReportFormType {
  private static accidentReport: Array<string> = ['First accident medical report', 'Progress accident medical report', 'Final accident medical report'];
  private static diseaseReport: Array<string> = ['First disease medical report', 'Progress disease medical report', 'Final disease medical report'];

  static setReportFormType(value: string): void {

    localStorage.setItem('reportType', value);

    if (ReportFormType.includes(this.accidentReport, value)) {
      localStorage.setItem('eventCategoryId', String('1'));

      return;
    }

    if (ReportFormType.includes(this.diseaseReport, value)) {
      localStorage.setItem('eventCategoryId', String('2'));

      return;
    }

    return;
  }

  static getReportFormType(): string {
    return localStorage.getItem('reportType');
  }

  static reportEventCategoryType(): number {
    const reportType = localStorage.getItem('eventCategoryId');
    return Number(reportType);
  }

  private static includes(container, value): boolean {

    return container.indexOf(value) >= 0;
  }

}
