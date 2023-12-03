import React, { Component, ReactEventHandler } from 'react'
import * as Realm from 'realm-web';
import { IIncome } from '../../../models/income.interface'
import TrashCan from '../../../shared_icons/trash_can.svg'
import Pencil from '../../../shared_icons/pencil.svg'
import './Incomes.css'
import Navbar from '../../helpers/navbar/Navbar';
import { INavbarBtn } from '../../../models/navbar_btns.interface';
import { IIncomeFormData } from '../../../models/form_data.interface';
import { IDatabaseResponse } from '../../../models/database_response.interface';
import CalendarIcon from '../../../shared_icons/calendar.svg'

interface IncomesProps {
  user: Realm.User,
  data: IIncome[],
  indicators?: {
    waiting_screen: HTMLDivElement,
    success_screen: HTMLDivElement
  }
  goToControlPanel: () => void,
  syncData: () => Promise<any>
}

interface IncomesState {
  navbar_btns: INavbarBtn[],
  insert_form_data: IIncomeFormData,
  update_form_data: IIncomeFormData,
  income_to_update?: IIncome, 
  data: IIncome[],
  isInsertFormOpen: boolean,
  isUpdateFormOpen: boolean
}

export default class Incomes extends Component<IncomesProps, IncomesState> {
  constructor(props: IncomesProps) {
    super(props);

    this.generateDataList = this.generateDataList.bind(this);
    this.handleChangeInsert = this.handleChangeInsert.bind(this)
    this.handleChangeUpdate = this.handleChangeUpdate.bind(this)
    this.openInserIncomeForm = this.openInserIncomeForm.bind(this);
    this.closeInsertIncomeForm = this.closeInsertIncomeForm.bind(this);
    this.openUpdateIncomeForm = this.openUpdateIncomeForm.bind(this);
    this.closeUpdateIncomeForm = this.closeUpdateIncomeForm.bind(this);
    this.insertIncome = this.insertIncome.bind(this);
    this.updateIncome = this.updateIncome.bind(this);
    this.deleteIncome = this.deleteIncome.bind(this);

    this.state = {
      navbar_btns: [
        {button_text: "Go back", onClick: props.goToControlPanel},
        {button_text: "Insert income", onClick: this.openInserIncomeForm}
      ],
      insert_form_data: {
        date: '',
        amount: '',
        category: '',
        notes: ''
      },
      update_form_data: {
        date: '',
        amount: '',
        category: '',
        notes: ''
      },
      data: props.data,
      isInsertFormOpen: false,
      isUpdateFormOpen: false
    }
  }
  openDatePickerInsert() {
    var input_type_date: HTMLInputElement = document.querySelector(".insert-income-form input[type=date]")!;
    input_type_date.showPicker();
  }
  openDatePickerUpdate() {
    var input_type_date: HTMLInputElement = document.querySelector(".update-income-form input[type=date]")!;
    input_type_date.showPicker();
  }
  // generateDataList method dynamically generates list of options for filed 'category', based on the data in filed 'category' in database
  generateDataList(): React.ReactNode {
    var categories: string[] = [];
    
    for (const index in this.state.data) {
      let item: IIncome = this.state.data[index];
      if(!categories.includes(item.category)) {
        categories.push(item.category)
      }
    }
    return(<div>
      {categories.map((item: string, index: number): React.ReactNode => {
        return <option key={index} value={item}>{item}</option>
      })}
    </div>)
  }
  // handles changes of value of input fields and textarea on insert-income-form
  handleChangeInsert(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    var old_form_data: any = {...this.state.insert_form_data};
    var new_form_data: IIncomeFormData;
    var key: string = e.target.name;
    old_form_data[key] = e.target.value;
    if(key != "notes") old_form_data[key] = old_form_data[key].toUpperCase();
    new_form_data = {...old_form_data};
    this.setState({
      insert_form_data: new_form_data
    })
  }
  // handles changes of value of input fields and textarea on update-income-form
  handleChangeUpdate(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    var old_form_data: any = {...this.state.update_form_data};
    var new_form_data: IIncomeFormData;
    var key: string = e.target.name;
    old_form_data[key] = e.target.value;
    if(key != "notes") old_form_data[key] = old_form_data[key].toUpperCase();
    new_form_data = {...old_form_data};
    this.setState({
      update_form_data: new_form_data
    })
  }
  // openInsertIncomeForm displays insert-income-form
  openInserIncomeForm(): void {
    this.setState({
      isInsertFormOpen: true
    })
  }
  // closeInsertIncomeForm hides insert-income-form
  closeInsertIncomeForm(): void {
    let insert_form_data: IIncomeFormData = {
      date: '',
      amount: '',
      category: '',
      notes: '',
    }
    this.setState({
      insert_form_data,
      isInsertFormOpen: false
    })
  }
  // openUpdateIncomeForm displays insert-income-form
  openUpdateIncomeForm(e: React.MouseEvent<HTMLImageElement>): void {
    var income_id = e.currentTarget.parentElement!.parentElement!.id;
    var income: IIncome = this.state.data[0];
    var income_to_update: IIncome;

    for (const index in this.state.data) {
      income = this.state.data[index];
      if(income._id == income_id) break;
    }

    income_to_update = {...income};
    income_to_update._id = income_id;
    this.setState({
      income_to_update,
      update_form_data: {
        date: `${income.year}-${income.month}-${income.day}`,
        amount: income.amount,
        category: income.category,
        notes: income.notes || ""
      },
      isUpdateFormOpen: true
    })
  }
  // closeUpdateIncomeForm hides insert-income-form
  closeUpdateIncomeForm(): void {
    let update_form_data: IIncomeFormData = {
      date: '',
      amount: '',
      category: '',
      notes: '',
    }
    this.setState({
      income_to_update: undefined,
      update_form_data,
      isUpdateFormOpen: false
    })
  }
  // insertIncome creates new record in databes filled with data from the form
  async insertIncome(e: React.FormEvent) {
    try {
      e.preventDefault();
      var waiting_screen: HTMLDivElement = this.props.indicators!.waiting_screen;
      var success_screen: HTMLDivElement = this.props.indicators!.success_screen;
      var new_income: IIncome = {
        year: this.state.insert_form_data.date?.split('-')[0]!,
        month: this.state.insert_form_data.date?.split('-')[1]!,
        day: this.state.insert_form_data.date?.split('-')[2]!,
        amount: Number(this.state.insert_form_data.amount!).toFixed(2),
        category: this.state.insert_form_data.category!,
        notes: this.state.insert_form_data.notes || ""
      };

      waiting_screen.style.display = "flex";
      waiting_screen.querySelector("span")!.innerText = "Inserting new income into database...";

      var db_response: IDatabaseResponse = await this.props.user.functions.Insert_Income(new_income);
      
      waiting_screen.style.display = "none";

      if(!db_response.isSuccess) throw db_response;
      
      waiting_screen.style.display = "flex"
      waiting_screen.querySelector("span")!.innerText = "Syncing data...";

      var new_data = await this.props.syncData();

      waiting_screen.style.display = "none";
      success_screen.style.display = "flex";
      success_screen.querySelector("span")!.innerText = db_response.message
      
      this.setState({
        data: new_data.incomes,
      })
      this.closeInsertIncomeForm();
      setTimeout(() => {
        success_screen.style.display = 'none';
      }, 1999);
    } catch (error: unknown) {
      alert("Error has occured!\nCheck the console!");
      console.error(error)
    }
  }
  async updateIncome(e: React.FormEvent) {
    try {
      e.preventDefault();
      var waiting_screen: HTMLDivElement = this.props.indicators!.waiting_screen;
      var success_screen: HTMLDivElement = this.props.indicators!.success_screen;
      
      var new_income: IIncome = {
        _id: this.state.income_to_update!._id!,
        year: this.state.update_form_data.date?.split('-')[0]!,
        month: this.state.update_form_data.date?.split('-')[1]!,
        day: this.state.update_form_data.date?.split('-')[2]!,
        amount: Number(this.state.update_form_data.amount!).toFixed(2),
        category: this.state.update_form_data.category!,
        notes: this.state.update_form_data.notes || ""
      };

      waiting_screen.style.display = "flex";
      waiting_screen.querySelector("span")!.innerText = "Updating this income...";

      var db_response: IDatabaseResponse = await this.props.user.functions.Update_Income(new_income);
      
      waiting_screen.style.display = "none";

      if(!db_response.isSuccess) throw db_response;
      
      waiting_screen.style.display = "flex"
      waiting_screen.querySelector("span")!.innerText = "Syncing data...";

      var new_data = await this.props.syncData();

      waiting_screen.style.display = "none";
      success_screen.style.display = "flex";
      success_screen.querySelector("span")!.innerText = db_response.message
      this.closeUpdateIncomeForm();
      this.setState({
        data: new_data.incomes,
      })
      setTimeout(() => {
        success_screen.style.display = 'none';
      }, 1999);
    } catch (error: unknown) {
      alert("Error has occured!\nCheck the console!");
      console.error(error)
    }
  }
  // deleteIncome deletes a record from a database. 
  // Method is called when user clicks on a button with trash can icon.
  // Then metod deletes a record filled with data from the row where button is located
  async deleteIncome(e: React.MouseEvent<HTMLImageElement>) {
    try {
      if(!window.confirm("Do you realy want to delete this income?\nNote: this action can not be undone!")) return;
      
      var income_id: string = e.currentTarget.parentElement!.parentElement!.id;
      var waiting_screen: HTMLDivElement = this.props.indicators!.waiting_screen;
      var success_screen: HTMLDivElement = this.props.indicators!.success_screen;
      
      waiting_screen.style.display = "flex";
      waiting_screen.querySelector("span")!.innerText = "Deleting this income from database...";

      var db_response: IDatabaseResponse = await this.props.user.functions.Delete_Income(income_id);
      
      waiting_screen.style.display = "none";

      if(!db_response.isSuccess) throw db_response;
      
      waiting_screen.style.display = "flex"
      waiting_screen.querySelector("span")!.innerText = "Syncing data...";

      var new_data = await this.props.syncData();

      waiting_screen.style.display = "none";
      success_screen.style.display = "flex";
      success_screen.querySelector("span")!.innerText = db_response.message
      
      this.setState({
        data: new_data.incomes,
      })
      setTimeout(() => {
        success_screen.style.display = 'none';
      }, 1999);
    }
    catch(error: any) {
      alert("Error has occured!\nCheck the console!");
      console.error(error)
    }
  }
  render() {
    return (
      <div className='incomes'>
        <Navbar controls={this.state.navbar_btns}></Navbar>
        <table>
          <thead>
            <tr>
              <th>{'Date'}</th>
              <th>{'Amount'}</th>
              <th>{'Category'}</th>
              <th>{'Notes'}</th>
              <th colSpan={2}>{'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map((item: IIncome) : React.ReactNode => {
              return(
                <tr key={item._id!} id={item._id!}>
                  <td>{`${item.day}.${item.month}.${item.year}`}</td>
                  <td>{`${(Number(item.amount).toFixed(2))} KM`}</td>
                  <td>{item.category}</td>
                  <td>{item.notes}</td>
                  <td title='update'><img src={Pencil} onClick={this.openUpdateIncomeForm} /></td>
                  <td title='delete'><img src={TrashCan} onClick={this.deleteIncome} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className='insert-income-form' style={{display: this.state.isInsertFormOpen ? 'flex' : 'none'}}>
          <form onSubmit={(e: React.FormEvent) => {this.insertIncome(e)}}>
            <span>Date:</span>
            <button type='button' className="date-picker" onClick={this.openDatePickerInsert}>
              <span>
                {!!this.state.insert_form_data.date ? this.state.insert_form_data.date?.split('-').reverse().join('.') : "Pick a date..."}
              </span>
              <div className='calendar-container'>
                <img src={CalendarIcon}/>
                {/* Real date picker */}
                <input 
                  type='date' 
                  name='date' 
                  value={this.state.insert_form_data.date}
                  required
                  onChange={this.handleChangeInsert}
                ></input>
              </div>
            </button>

            <span>Amount:</span>
            <input 
              type='number' 
              name='amount' 
              min={'0'} 
              step={'0.01'}
              value={this.state.insert_form_data.amount}
              required
              onChange={this.handleChangeInsert}
            ></input>
            
            <span>Category:</span>
            <input 
              type='text' 
              name='category' 
              list='income-category-list'
              value={this.state.insert_form_data.category}
              required
              onChange={this.handleChangeInsert}
            ></input>
            
            <span>Notes:</span>
            <textarea 
              name="notes"
              value={this.state.insert_form_data.notes}
              onChange={this.handleChangeInsert}
            ></textarea>

            <div className='buttons-wrapper'>
              <button type='button' className='cancel' onClick={this.closeInsertIncomeForm}>{'Cancel'}</button>
              <button type='submit' className='submit'>{'Submit'}</button>
            </div>
          </form>

          <datalist id='income-category-list'>
            {this.generateDataList()}
          </datalist>
        </div>
        <div className='update-income-form' style={{display: this.state.isUpdateFormOpen ? 'flex' : 'none'}}>
          <form onSubmit={(e: React.FormEvent) => {this.updateIncome(e)}}>
            <span>Date:</span>
            <button type='button' className="date-picker" onClick={this.openDatePickerUpdate}>
              <span>
                {!!this.state.update_form_data.date ? this.state.update_form_data.date?.split('-').reverse().join('.') : "Pick a date..."}
              </span>
              <div className='calendar-container'>
                <img src={CalendarIcon}/>
                {/* Real date picker */}
                <input 
                  type='date' 
                  name='date' 
                  value={this.state.update_form_data.date}
                  required
                  onChange={this.handleChangeUpdate}
                ></input>
              </div>
            </button>

            <span>Amount:</span>
            <input 
              type='number' 
              name='amount' 
              min={'0'} 
              step={'0.01'}
              value={this.state.update_form_data.amount}
              required
              onChange={this.handleChangeUpdate}
            ></input>
            
            <span>Category:</span>
            <input 
              type='text' 
              name='category' 
              list='income-category-list'
              value={this.state.update_form_data.category}
              required
              onChange={this.handleChangeUpdate}
            ></input>
            
            <span>Notes:</span>
            <textarea 
              name="notes"
              value={this.state.update_form_data.notes}
              onChange={this.handleChangeUpdate}
            ></textarea>

            <div className='buttons-wrapper'>
              <button type='button' className='cancel' onClick={this.closeUpdateIncomeForm}>{'Cancel'}</button>
              <button type='submit' className='submit'>{'Submit'}</button>
            </div>
          </form>

          <datalist id='income-category-list'>
            {this.generateDataList()}
          </datalist>
        </div>
      </div>
    )
  }
}
