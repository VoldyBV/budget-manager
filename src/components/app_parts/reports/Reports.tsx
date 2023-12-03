import React, { Component, ReactNode } from 'react'
import "./Reports.css"
import Navbar from '../../helpers/navbar/Navbar'
import { IIncome } from '../../../models/income.interface'
import { IExpense } from '../../../models/expense.interface'
import { INavbarBtn } from '../../../models/navbar_btns.interface'
import * as ReportTypes from '../../../models/report_types.interface'

interface ReportsProps {
  incomes: IIncome[],
  expenses: IExpense[],
  goToControlPanel: () => void,
}
interface ReportsState {
  navbar_btns: INavbarBtn[],
  report?: unknown,
  monthly_report_settings: {
    report_type: string,
    month_and_year: string,
  },
  yearly_report_settings: {
    report_type: string,
    year: string,
  },
  isMonthlyReportCreatorOpen: boolean,
  isYearlyReportCreatorOpen: boolean
}

export default class Reports extends Component<ReportsProps, ReportsState> {
  constructor(props: ReportsProps) {
    super(props);
    // this method prints current report
    this.printReport = this.printReport.bind(this);
    //method for handling changes of monthly report settings
    this.handleMonthlyReportCreatorChange = this.handleMonthlyReportCreatorChange.bind(this);
    //method for handling changes of yearly report settings
    this.handleYearlyReportCreatorChange = this.handleYearlyReportCreatorChange.bind(this);
    //methods for openning and closing monthly report reator form
    this.openMonthlyReportCreator = this.openMonthlyReportCreator.bind(this);
    this.closeMonthlyReportCreator = this.closeMonthlyReportCreator.bind(this);
    //methods for openning and closing yearly report reator form
    this.openYearlyReportCreator = this.openYearlyReportCreator.bind(this);
    this.closeYearlyReportCreator = this.closeYearlyReportCreator.bind(this);
    //methods for creating monthly reports
    this.createMonthlyReport = this.createMonthlyReport.bind(this);
    this.createMonthlyIncomeReport = this.createMonthlyIncomeReport.bind(this);
    this.createMonthlyExpenseReport = this.createMonthlyExpenseReport.bind(this);
    //methods for creating yearly reports
    this.createYearlyReport = this.createYearlyReport.bind(this);
    this.createYearlyIncomeReport = this.createYearlyIncomeReport.bind(this);
    this.createYearlyExpenseReport =this.createYearlyExpenseReport.bind(this);
    //methods for generating reports
    this.generateReport = this.generateReport.bind(this);
    this.generateMonthlyIncomeReport = this.generateMonthlyIncomeReport.bind(this);
    this.generateMonthlyExpenseReport = this.generateMonthlyExpenseReport.bind(this);
    this.generateYearlyIncomeReport = this.generateYearlyIncomeReport.bind(this);
    this.generateYearlyExpenseReport = this.generateYearlyExpenseReport.bind(this);

    this.state = {
      navbar_btns: [
        {button_text: "Go back", onClick: props.goToControlPanel},
        {button_text: "Create monthly report", onClick: this.openMonthlyReportCreator},
        {button_text: "Create yearly report", onClick: this.openYearlyReportCreator},
        {button_text: "Print report", onClick: this.printReport}
      ],
      monthly_report_settings: {
        report_type: '',
        month_and_year: ''
      },
      yearly_report_settings: {
        report_type: '',
        year: '',
      },
      isMonthlyReportCreatorOpen: false,
      isYearlyReportCreatorOpen: false
    }
  }
  printReport() {
    var html: HTMLElement = document.querySelector("html")!;
    var navbar: HTMLDivElement = document.querySelector(".navbar")!;
    
    html.classList.add("print-view");
    navbar.style.display = 'none';

    window.print();

    html.classList.remove("print-view");
    navbar.removeAttribute("style");
  }
  handleMonthlyReportCreatorChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    var old_settings: any = {...this.state.monthly_report_settings};
    var new_settings: {
      report_type: string,
      month_and_year: string
    };
    var key: string = e.target.name;
    old_settings[key] = e.target.value;
    new_settings = {...old_settings};
    this.setState({
      monthly_report_settings: new_settings
    })
  }
  handleYearlyReportCreatorChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    var old_settings: any = {...this.state.yearly_report_settings};
    var new_settings: {
      report_type: string,
      year: string
    };
    var key: string = e.target.name;
    old_settings[key] = e.target.value;
    new_settings = {...old_settings};
    this.setState({
      yearly_report_settings: new_settings
    })
  }
  //these methods are for creating monthly reports
  openMonthlyReportCreator(): void {
    this.setState({
      isMonthlyReportCreatorOpen: true,
    });
  }
  closeMonthlyReportCreator(): void {
    this.setState({
      monthly_report_settings: {
        report_type: '',
        month_and_year: '',
      },
      isMonthlyReportCreatorOpen: false,
    });
  }
  //these methods are for creating yearly reports
  openYearlyReportCreator(): void {
    this.setState({
      isYearlyReportCreatorOpen: true,
    });
  }
  closeYearlyReportCreator(): void {
    this.setState({
      yearly_report_settings: {
        report_type: '',
        year: '',
      },
      isYearlyReportCreatorOpen: false,
    });
  }
  // when user submits monthly-report-creator, this method will be called
  // This method builds monthly report according to report settings
  createMonthlyReport(e: React.FormEvent) {
    e.preventDefault();
    var reporty_type = this.state.monthly_report_settings.report_type;
    var month = this.state.monthly_report_settings.month_and_year.split('-')[1];
    var year = this.state.monthly_report_settings.month_and_year.split('-')[0]
    var data: IIncome[] | IExpense[] = [];

    if(reporty_type === 'incomes') {
      data = this.props.incomes.filter((item: IIncome) => item.month == month && item.year == year);
      this.createMonthlyIncomeReport(data, month, year);
    }
    else if(reporty_type === 'expenses') {
      var incomes: IIncome[] = this.props.incomes.filter((item: IIncome) => item.month == month && item.year == year);
      data = this.props.expenses.filter((item: IExpense) => item.month == month && item.year == year);
      this.createMonthlyExpenseReport(incomes, data, month, year);
    }

    this.closeMonthlyReportCreator();
  }
  // this method creates monthly income report
  createMonthlyIncomeReport(data: IIncome[], month: string, year: string) {
    var total_amount: number = 0;
    var total_income_by_category: {category: string, total_amount: number}[] = [];
    var categories: string[] = [];
    var amounts: number[] = [];

    data.forEach((item: IIncome) => {
      total_amount += Number(item.amount);
    })
    data.forEach((item: IIncome) => {
      var i = categories.indexOf(item.category);
      if(i > -1){
        amounts[i] += Number(item.amount);
      }
      else {
        categories.push(item.category);
        amounts.push(Number(item.amount));
      }
    });
    for(var i = 0; i < categories.length; i++) {
      total_income_by_category.push({
        category: categories[i],
        total_amount: amounts[i]
      });
    }
    var report: ReportTypes.MonthlyIncomeReport = {
      data,
      monthly_overview: {
        report_for: (new Date(`${month}/01/${year}`)).toLocaleString('default', {month: 'long'}) + " " + year,
        total_amount
      },
      total_income_by_category
    }

    this.setState({
      report
    })
  }
  // this method creates monthly expense report
  createMonthlyExpenseReport(incomes: IIncome[], data: IExpense[], month: string, year: string){
    var report_for: string = '';
    var days: number = 0;
    var budget: number = 0;
    var total_amount: number = 0;
    var daily_avreage: number = 0;
    var the_rest: number = 0;
    var total_expense_by_category: {category: string, total_amount: number}[] = [];
    var categories: string[] = [];
    var amounts: number[] = [];

    report_for = (new Date(`${month}/01/${year}`)).toLocaleString('default', {month: 'long'}) + " " + year;
    days = new Date(Number(year), Number(month), 0).getDate();
    incomes.forEach((item) => {budget += Number(item.amount)});
    data.forEach((item) => {total_amount += Number(item.amount)});
    daily_avreage = Number((total_amount / days).toFixed(2));
    the_rest = budget - total_amount;
    data.forEach((item) => {
      let i = categories.indexOf(item.category);

      if(i > -1) {
        amounts[i] += Number(item.amount);
      }
      else{
        categories.push(item.category);
        amounts.push(Number(item.amount));
      }
    });
    for(var i = 0; i < categories.length; i++) {
      total_expense_by_category.push({
        category: categories[i],
        total_amount: amounts[i]
      });
    }
    var report: ReportTypes.MonthlyExpenseReport = {
      data,
      monthly_overview:{
        report_for,
        days,
        budget,
        total_amount,
        daily_avreage,
        the_rest
      },
      total_expense_by_category
    }

    this.setState({
      report
    })
  }
  // when user submits monthly-report-creator, this method will be called
  // This method builds monthly report according to report settings
  createYearlyReport(e: React.FormEvent) {
    e.preventDefault();
    var reporty_type = this.state.yearly_report_settings.report_type;
    var year = this.state.yearly_report_settings.year;
    var data: IIncome[] | IExpense[] = [];

    if(reporty_type === 'incomes') {
      data = this.props.incomes.filter((item: IIncome) => item.year == year);
      this.createYearlyIncomeReport(data, year);
    }
    else if(reporty_type === 'expenses') {
      var incomes: IIncome[] = this.props.incomes.filter((item: IIncome) => item.year == year);
      data = this.props.expenses.filter((item: IExpense) => item.year == year);
      this.createYearlyExpenseReport(data, year);
    }
    this.closeYearlyReportCreator();
  }
  // This method creates yearly income report
  createYearlyIncomeReport(data: IIncome[], year: string) {
    var yearly_overview =  {
        report_for: '',
        total_amount: 0
    };
    var total_income_by_month: any = {
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
    };
    var total_income_by_category: {
        category: string,
        total_amount: number,
    }[] = [];
    var categories: string[] = [];
    var amounts: number[] = [];

    yearly_overview.report_for = year;
    data.forEach((item) => {
      if(item.category != "OPM") yearly_overview.total_amount += Number(item.amount)
    });
    Object.keys(total_income_by_month).forEach((key) => {
      let month_number: string = '';
      switch(key) {
        case 'january': month_number = "01"; break;
        case 'february': month_number = "02"; break;
        case 'march': month_number = "03"; break;
        case 'april': month_number = "04"; break;
        case 'may': month_number = "05"; break;
        case 'june': month_number = "06"; break;
        case 'july': month_number = "07"; break;
        case 'august': month_number = "08"; break;
        case 'september': month_number = "09"; break;
        case 'october': month_number = "10"; break;
        case 'november': month_number = "11"; break;
        case 'december': month_number = "12"; break;
        default: month_number = ''
      }
      let incomes_of_this_month = data.filter(item => item.month == month_number);
      incomes_of_this_month.forEach((item) => {
        if(item.category != "OPM") total_income_by_month[key] += Number(item.amount)
      })
    });
    data.forEach((item) => {
      let i = categories.indexOf(item.category);

      if(i > -1) {
        amounts[i] += Number(item.amount)
      }
      else if(item.category != "OPM") {
        categories.push(item.category);
        amounts.push(Number(item.amount));
      }
    });

    for(let i = 0; i < categories.length; i++) {
      total_income_by_category.push({
        category: categories[i],
        total_amount: amounts[i],
      })
    }
    
    var report: ReportTypes.YearlyIncomeReport = {
      yearly_overview,
      total_income_by_month,
      total_income_by_category
    }
    this.setState({
      report
    })
  }
  // this method creates yearly expense report
  createYearlyExpenseReport(data: IExpense[], year: string) {
    var yearly_overview =  {
        report_for: '',
        days: 0,
        total_amount: 0,
        daily_avreage: 0
    };
    var total_expense_by_month: any = {
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
    };
    var total_expense_by_category: {
        category: string,
        total_amount: number,
    }[] = [];
    var categories: string[] = [];
    var amounts: number[] = [];

    yearly_overview.report_for = year;
    yearly_overview.days = (Number(year) % 4 === 0 && Number(year) % 100 > 0) || Number(year) % 400 === 0 ? 366 : 365;
    data.forEach((item) => {
      yearly_overview.total_amount += Number(item.amount)
    });
    yearly_overview.daily_avreage = yearly_overview.total_amount / yearly_overview.days;
    Object.keys(total_expense_by_month).forEach((key) => {
      let month_number: string = '';
      switch(key) {
        case 'january': month_number = "01"; break;
        case 'february': month_number = "02"; break;
        case 'march': month_number = "03"; break;
        case 'april': month_number = "04"; break;
        case 'may': month_number = "05"; break;
        case 'june': month_number = "06"; break;
        case 'july': month_number = "07"; break;
        case 'august': month_number = "08"; break;
        case 'september': month_number = "09"; break;
        case 'october': month_number = "10"; break;
        case 'november': month_number = "11"; break;
        case 'december': month_number = "12"; break;
        default: month_number = ''
      }
      let expenses_of_this_month = data.filter(item => item.month == month_number);
      expenses_of_this_month.forEach((item) => {
        total_expense_by_month[key] += Number(item.amount)
      })
    });
    data.forEach((item) => {
      let i = categories.indexOf(item.category);

      if(i > -1) {
        amounts[i] += Number(item.amount)
      }
      else{
        categories.push(item.category);
        amounts.push(Number(item.amount));
      }
    });

    for(let i = 0; i < categories.length; i++) {
      total_expense_by_category.push({
        category: categories[i],
        total_amount: amounts[i],
      })
    }
    
    var report: ReportTypes.YearlyExpenseReport = {
      yearly_overview,
      total_expense_by_month,
      total_expense_by_category
    }
    this.setState({
      report
    })
  }
  // this method generates report based on report data
  // report data is stored in this.state.report
  generateReport(): React.ReactNode {
    if(this.state.report === undefined) {
      return <h1 className='no-report-message'>Please create a report</h1>
    }
    else if(ReportTypes.isYearlyIncomeReport(this.state.report)) {
      return this.generateYearlyIncomeReport(this.state.report!)
    }
    else if(ReportTypes.isYearlyExpenseReport(this.state.report)) {
      return this.generateYearlyExpenseReport(this.state.report!)
    }
    else if(ReportTypes.isMonthlyIncomeReport(this.state.report)){
      return this.generateMonthlyIncomeReport(this.state.report!);
    }
    else if(ReportTypes.isMonthlyExpenseReport(this.state.report)) {
      return this.generateMonthlyExpenseReport(this.state.report!);
    }
    return <h1 className='no-report-message'>Please create a report</h1>
  }
  generateMonthlyIncomeReport(report_data: ReportTypes.MonthlyIncomeReport): React.ReactNode {
    if(report_data.data.length == 0){ 
      return <h1 className='no-report-message'>
        There is not a single income for {report_data.monthly_overview.report_for}
      </h1>
    }
    else {
      return(
        <table>
          <tr className='row-level-0'>
            <td colSpan={4}>{'Monthly income report'}</td>
          </tr>
          <tr className='row-level-1'>
            <td colSpan={4}>{'Budget overview'}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th colSpan={2}>{'Report for:'}</th>
            <td colSpan={2}>{report_data.monthly_overview.report_for}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th colSpan={2}>{'Total amount:'}</th>
            <td colSpan={2}>{`${report_data.monthly_overview.total_amount.toFixed(2)} KM`}</td>
          </tr>
          <tr className='row-level-1'>
            <td colSpan={4}>{'Total amount by category'}</td>
          </tr>
          <tr className='row-level-2-b'>
            <th colSpan={2}>{'Category'}</th>
            <th colSpan={2}>{'Amount'}</th>
          </tr>
          {report_data.total_income_by_category.map((item) => {
            return(<tr className='row-level-3'>
              <td colSpan={2}>{item.category}</td>
              <td colSpan={2}>{item.total_amount.toFixed(2) + " KM"}</td>
            </tr>)
          })}
          <tr className='row-level-1'>
            <td colSpan={4}>{"All records"}</td>
          </tr>
          <tr className='row-level-2-b'>
            <td>{'Date'}</td>
            <td>{'Amount'}</td>
            <td>{'Category'}</td>
            <td>{'Notes'}</td>
          </tr>
          {report_data.data.map((item) => {
            return(
              <tr className='row-level-3'>
                <td>{`${item.day}.${item.month}.${item.year}`}</td>
                <td>{`${item.amount}`}</td>
                <td>{`${item.category}`}</td>
                <td>{`${item.notes}`}</td>
              </tr>
            )
          })}
        </table>
      )
    }
  }
  generateMonthlyExpenseReport(report_data: ReportTypes.MonthlyExpenseReport): React.ReactNode {
    if(report_data.data.length == 0){ 
      return <h1 className='no-report-message'>
        There is not a single expense for {report_data.monthly_overview.report_for}
      </h1>
    }
    else{
      return(
        <table>
          <tr className='row-level-0'>
            <td colSpan={6}>{'Monthly expense report'}</td>
          </tr>
          <tr className='row-level-1'>
            <td colSpan={6}>{'General overview'}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th colSpan={3}>{'Report for:'}</th>
            <td colSpan={3}>{report_data.monthly_overview.report_for}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th colSpan={3}>{'Days:'}</th>
            <td colSpan={3}>{report_data.monthly_overview.days}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th colSpan={3}>{'Budget:'}</th>
            <td colSpan={3}>{report_data.monthly_overview.budget.toFixed(2) + " KM"}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th colSpan={3}>{'Total amount spent:'}</th>
            <td colSpan={3}>{report_data.monthly_overview.total_amount.toFixed(2) + " KM"}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th colSpan={3}>{'Daily avreage:'}</th>
            <td colSpan={3}>{report_data.monthly_overview.daily_avreage.toFixed(2) + " KM"}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th colSpan={3}>{'The rest of the money'}</th>
            <td colSpan={3}>{report_data.monthly_overview.the_rest.toFixed(2) + " KM"}</td>
          </tr>
          <tr className='row-level-1'>
            <td colSpan={6}>{'Total amount by category'}</td>
          </tr>
          <tr className='row-level-2-b'>
            <th colSpan={3}>{'Category'}</th>
            <th colSpan={3}>{'Amount'}</th>
          </tr>
          {report_data.total_expense_by_category.map((item) => {
            return(<tr className='row-level-3'>
              <td colSpan={3}>{item.category}</td>
              <td colSpan={3}>{item.total_amount.toFixed(2) + " KM"}</td>
            </tr>)
          })}
          <tr className='row-level-1'>
            <td colSpan={6}>{"All records"}</td>
          </tr>
          <tr className='row-level-2-b'>
            <td>{'Date'}</td>
            <td>{'Amount'}</td>
            <td>{'Category'}</td>
            <td>{'Receipt'}</td>
            <td colSpan={2}>{'Notes'}</td>
          </tr>
          {report_data.data.map((item) => {
            return(
              <tr className='row-level-3'>
                <td>{`${item.day}.${item.month}.${item.year}`}</td>
                <td>{`${item.amount}`}</td>
                <td>{`${item.category}`}</td>
                <td>{`${item.receipt_number}`}</td>
                <td>{`${item.notes}`}</td>
              </tr>
            )
          })}
        </table>
      )
    }
  }
  generateYearlyIncomeReport(report_data: ReportTypes.YearlyIncomeReport): React.ReactNode {
    if(report_data.yearly_overview.total_amount == 0){ 
      return <h1 className='no-report-message'>
        There is not a single income for {report_data.yearly_overview.report_for}
      </h1>
    }
    else {
      return(
        <table>
        <tr className='row-level-0'>
          <td colSpan={2}>{'Yearly income report'}</td>
        </tr>
        <tr className='row-level-1'>
          <td colSpan={2}>{'General overview'}</td>
        </tr>
          <tr className='row-level-2-a'>
            <th>{'Report for:'}</th>
            <td>{report_data.yearly_overview.report_for}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th>{'Total amount:'}</th>
            <td>{`${report_data.yearly_overview.total_amount.toFixed(2)} KM`}</td>
          </tr>
        <tr className='row-level-1'>
          <td colSpan={2}>{'Total income by month'}</td>
        </tr>
        <tr className='row-level-2-b'>
          <td>{'Month'}</td>
          <td>{'Total amount'}</td>
        </tr>
        {Object.entries(report_data.total_income_by_month).map((item) => {
          const [key, value] = item;
          return(
            <tr className='row-level-3'>
              <td>{key}</td>
              <td>{value.toFixed(2) + " KM"}</td>
            </tr>
          )
        })}
        <tr className='row-level-1'>
          <td colSpan={2}>{'Total income by category'}</td>
        </tr>
        <tr className='row-level-2-b'>
          <td>{'Category'}</td>
          <td>{'Total amount'}</td>
        </tr>
        {report_data.total_income_by_category.map((item) => {
          return(
            <tr className='row-level-3'>
              <td>{item.category}</td>
              <td>{item.total_amount.toFixed(2) + " KM"}</td>
            </tr>
          )
        })}
        </table>
      )
    }
  }
  generateYearlyExpenseReport(report_data: ReportTypes.YearlyExpenseReport): React.ReactNode {
    if(report_data.yearly_overview.total_amount == 0){ 
      return <h1 className='no-report-message'>
        There is not a single expense for {report_data.yearly_overview.report_for}
      </h1>
    }
    else {
      return(
        <table>
        <tr className='row-level-0'>
          <td colSpan={2}>{'Yearly expense report'}</td>
        </tr>
        <tr className='row-level-1'>
          <td colSpan={2}>{'General overview'}</td>
        </tr>
          <tr className='row-level-2-a'>
            <th>{'Report for:'}</th>
            <td>{report_data.yearly_overview.report_for}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th>{'Days:'}</th>
            <td>{report_data.yearly_overview.days}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th>{'Total amount:'}</th>
            <td>{`${report_data.yearly_overview.total_amount.toFixed(2)} KM`}</td>
          </tr>
          <tr className='row-level-2-a'>
            <th>{'Daily avreage:'}</th>
            <td>{report_data.yearly_overview.daily_avreage.toFixed(2) + " KM"}</td>
          </tr>
        <tr className='row-level-1'>
          <td colSpan={2}>{'Total expense by month'}</td>
        </tr>
        <tr className='row-level-2-b'>
          <td>{'Month'}</td>
          <td>{'Total amount'}</td>
        </tr>
        {Object.entries(report_data.total_expense_by_month).map((item) => {
          const [key, value] = item;
          return(
            <tr className='row-level-3'>
              <td>{key}</td>
              <td>{value.toFixed(2) + " KM"}</td>
            </tr>
          )
        })}
        <tr className='row-level-1'>
          <td colSpan={2}>{'Total expense by category'}</td>
        </tr>
        <tr className='row-level-2-b'>
          <td>{'Category'}</td>
          <td>{'Total amount'}</td>
        </tr>
        {report_data.total_expense_by_category.map((item) => {
          return(
            <tr className='row-level-3'>
              <td>{item.category}</td>
              <td>{item.total_amount.toFixed(2) + " KM"}</td>
            </tr>
          )
        })}
        </table>
      )
    }
  }
  render() {
    return (
      <div className='reports'>
        <Navbar controls={this.state.navbar_btns}></Navbar>
        {this.generateReport()}
        <div className='monthly-report-creator' style={{display: this.state.isMonthlyReportCreatorOpen ? 'flex' : 'none'}}>
          <form onSubmit={this.createMonthlyReport}>
            <span>Report for:</span>
            <select 
              name='report_type' 
              value={this.state.monthly_report_settings.report_type}
              onChange={this.handleMonthlyReportCreatorChange}
              required
            >
              <option value='' style={{display: 'none'}}>Select item...</option>
              <option value={'incomes'}>Incomes</option>
              <option value={'expenses'}>Expenses</option>
            </select>

            <span>Choose month and year</span>
            <input 
              name='month_and_year' 
              type='month'
              value={this.state.monthly_report_settings.month_and_year}
              onChange={this.handleMonthlyReportCreatorChange}
              required
            ></input>

            <div className='buttons-wrapper'>
              <button type='button' className='cancel' onClick={this.closeMonthlyReportCreator}>{'Cancel'}</button>
              <button type='submit' className='submit'>{'Submit'}</button>
            </div>
          </form>
        </div>
        <div className='yearly-report-creator' style={{display: this.state.isYearlyReportCreatorOpen ? 'flex' : 'none'}}>
          <form onSubmit={this.createYearlyReport}>
            <span>Report for:</span>
            <select 
              name='report_type' 
              value={this.state.yearly_report_settings.report_type}
              onChange={this.handleYearlyReportCreatorChange}
              required
            >
              <option value='' style={{display: 'none'}}>Select item...</option>
              <option value={'incomes'}>Incomes</option>
              <option value={'expenses'}>Expenses</option>
            </select>

            <span>Choose month and year</span>
            <input 
              name='year' 
              type='number'
              min={2023}
              value={this.state.yearly_report_settings.year}
              required
              onChange={this.handleYearlyReportCreatorChange}
            ></input>

            <div className='buttons-wrapper'>
              <button type='button' className='cancel' onClick={this.closeYearlyReportCreator}>{'Cancel'}</button>
              <button type='submit' className='submit'>{'Submit'}</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}
