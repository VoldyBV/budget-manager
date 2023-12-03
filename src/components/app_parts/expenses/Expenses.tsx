import React, { Component } from 'react'
import * as Realm from 'realm-web';
import { IExpense } from '../../../models/expense.interface';
import TrashCan from '../../../shared_icons/trash_can.svg'
import Pencil from '../../../shared_icons/pencil.svg'
import "./Expenses.css"
import Navbar from '../../helpers/navbar/Navbar';
import { INavbarBtn } from '../../../models/navbar_btns.interface';
import { IExpenseFormData } from '../../../models/form_data.interface';
import { IDatabaseResponse } from '../../../models/database_response.interface';

interface ExpensesProps {
  user: Realm.User,
  data: IExpense[],
  indicators?: {
    waiting_screen: HTMLDivElement,
    success_screen: HTMLDivElement
  }
  goToControlPanel: () => void,
  syncData: () => Promise<any>
}

interface ExpensesState {
  navbar_btns: INavbarBtn[],
  insert_form_data: IExpenseFormData,
  update_form_data: IExpenseFormData,
  expense_to_update?: IExpense, 
  data: IExpense[],
  isInsertFormOpen: boolean,
  isUpdateFormOpen: boolean
}

export default class Expenses extends Component<ExpensesProps, ExpensesState> {
  constructor(props: ExpensesProps) {
    super(props);    
  
    this.generateDataList = this.generateDataList.bind(this);
    this.handleChangeInsert = this.handleChangeInsert.bind(this);
    this.handleChangeUpdate = this.handleChangeUpdate.bind(this);
    this.openInsertExpenseForm = this.openInsertExpenseForm.bind(this);
    this.closeInsertExpenseForm = this.closeInsertExpenseForm.bind(this);
    this.openUpdateExpenseForm = this.openUpdateExpenseForm.bind(this);
    this.closeUpdateExpenseForm = this.closeUpdateExpenseForm.bind(this);
    this.insertExpense = this.insertExpense.bind(this);
    this.deleteExpense = this.deleteExpense.bind(this);

    this.state = {
      navbar_btns: [
        {button_text: "Go back", onClick: props.goToControlPanel},
        {button_text: "Insert expense", onClick: this.openInsertExpenseForm}
      ],
      insert_form_data: {
        date: '',
        amount: '',
        category: '',
        receipt_number: '',
        notes: ''
      },
      update_form_data: {
        date: '',
        amount: '',
        category: '',
        receipt_number: '',
        notes: ''
      },
      data: props.data,
      isInsertFormOpen: false,
      isUpdateFormOpen: false
    }
  }
  // generateDataList method dynamically generates list of options for filed 'category', based on the data in filed 'category' in database
  generateDataList(): React.ReactNode {
    var categories: string[] = [];
    
    for (const index in this.state.data) {
      let item: IExpense = this.state.data[index];
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
  // handles changes of value of input fields and textarea on insert-expense-form
  handleChangeInsert(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    var old_form_data: any = {...this.state.insert_form_data};
    var new_form_data: IExpenseFormData;
    var key: string = e.target.name;
    old_form_data[key] = e.target.value;
    if(key != "notes") old_form_data[key] = old_form_data[key].toUpperCase();
    new_form_data = {...old_form_data};
    this.setState({
      insert_form_data: new_form_data
    })
  }
  // handles changes of value of input fields and textarea on update-expense-form
  handleChangeUpdate(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    var old_form_data: any = {...this.state.update_form_data};
    var new_form_data: IExpenseFormData;
    var key: string = e.target.name;
    old_form_data[key] = e.target.value;
    if(key != "notes") old_form_data[key] = old_form_data[key].toUpperCase();
    new_form_data = {...old_form_data};
    this.setState({
      update_form_data: new_form_data
    })
  }
  // openInsertIncomeForm displays insert-expense-form
  openInsertExpenseForm(): void {
    this.setState({
      isInsertFormOpen: true
    })
  }
  // closeInsertIncomeForm hides insert-expense-form
  closeInsertExpenseForm(): void {
    let insert_form_data: IExpenseFormData = {
      date: '',
      amount: '',
      category: '',
      receipt_number: '',
      notes: '',
    }
    this.setState({
      insert_form_data,
      isInsertFormOpen: false
    })
  }
  // openUpdateExpenseForm displays insert-expense-form
  openUpdateExpenseForm(e: React.MouseEvent<HTMLImageElement>): void {
    var expense_id = e.currentTarget.parentElement!.parentElement!.id;
    var expense: IExpense = this.state.data[0];
    var expense_to_update: IExpense;

    for (const index in this.state.data) {
      expense = this.state.data[index];
      if(expense._id == expense_id) break;
    }

    expense_to_update = {...expense};
    expense_to_update._id = expense_id;
    this.setState({
      expense_to_update,
      update_form_data: {
        date: `${expense.year}-${expense.month}-${expense.day}`,
        amount: expense.amount,
        category: expense.category,
        receipt_number: expense.receipt_number,
        notes: expense.notes || ""
      },
      isUpdateFormOpen: true
    })
  }
  // closeUpdateExpenseForm hides insert-expense-form
  closeUpdateExpenseForm(): void {
    let update_form_data: IExpenseFormData = {
      date: '',
      amount: '',
      category: '',
      notes: '',
    }
    this.setState({
      expense_to_update: undefined,
      update_form_data,
      isUpdateFormOpen: false
    })
  }
  // insertExpense creates new record in databes filled with data from the form
  async insertExpense(e: React.FormEvent) {
    try {
      e.preventDefault();
      var waiting_screen: HTMLDivElement = this.props.indicators!.waiting_screen;
      var success_screen: HTMLDivElement = this.props.indicators!.success_screen;
      var new_expense: IExpense = {
        year: this.state.insert_form_data.date?.split('-')[0]!,
        month: this.state.insert_form_data.date?.split('-')[1]!,
        day: this.state.insert_form_data.date?.split('-')[2]!,
        amount: Number(this.state.insert_form_data.amount!).toFixed(2),
        category: this.state.insert_form_data.category!,
        receipt_number: this.state.insert_form_data.receipt_number || "",
        notes: this.state.insert_form_data.notes || ""
      };

      waiting_screen.style.display = "flex";
      waiting_screen.querySelector("span")!.innerText = "Inserting new expense into database...";

      var db_response: IDatabaseResponse = await this.props.user.functions.Insert_Expense(new_expense);
      
      waiting_screen.style.display = "none";

      if(!db_response.isSuccess) throw db_response;
      
      waiting_screen.style.display = "flex"
      waiting_screen.querySelector("span")!.innerText = "Syncing data...";

      var new_data = await this.props.syncData();

      waiting_screen.style.display = "none";
      success_screen.style.display = "flex";
      success_screen.querySelector("span")!.innerText = db_response.message
      this.closeInsertExpenseForm()
      this.setState({
        data: new_data.expenses,
      })
      setTimeout(() => {
        success_screen.style.display = 'none';
      }, 1999);
    } catch (error: unknown) {
      alert("Error has occured!\nCheck the console!");
      console.error(error)
    }
  }
  async updateExpense(e: React.FormEvent) {
    try {
      e.preventDefault();
      var waiting_screen: HTMLDivElement = this.props.indicators!.waiting_screen;
      var success_screen: HTMLDivElement = this.props.indicators!.success_screen;
      
      var new_expense: IExpense = {
        _id: this.state.expense_to_update!._id!,
        year: this.state.update_form_data.date?.split('-')[0]!,
        month: this.state.update_form_data.date?.split('-')[1]!,
        day: this.state.update_form_data.date?.split('-')[2]!,
        amount: Number(this.state.update_form_data.amount!).toFixed(2),
        category: this.state.update_form_data.category!,
        receipt_number: this.state.update_form_data.receipt_number || "",
        notes: this.state.update_form_data.notes || ""
      };

      waiting_screen.style.display = "flex";
      waiting_screen.querySelector("span")!.innerText = "Updating this expense...";

      var db_response: IDatabaseResponse = await this.props.user.functions.Update_Expense(new_expense);
      
      waiting_screen.style.display = "none";

      if(!db_response.isSuccess) throw db_response;
      
      waiting_screen.style.display = "flex"
      waiting_screen.querySelector("span")!.innerText = "Syncing data...";

      var new_data = await this.props.syncData();

      waiting_screen.style.display = "none";
      success_screen.style.display = "flex";
      success_screen.querySelector("span")!.innerText = db_response.message
      this.closeUpdateExpenseForm();
      this.setState({
        data: new_data.expenses,
      })
      setTimeout(() => {
        success_screen.style.display = 'none';
      }, 1999);
    } catch (error: unknown) {
      alert("Error has occured!\nCheck the console!");
      console.error(error)
    }
  }
  // deleteExpense deletes a record from a database. 
  // Method is called when user clicks on a button with trash can icon.
  // Then metod deletes a record filled with data from the row where button is located
  async deleteExpense(e: React.MouseEvent<HTMLImageElement>) {
    try {
      if(!window.confirm("Do you realy want to delete this expense?\nNote: this action can not be undone!")) return;
      
      var expense_id: string = e.currentTarget.parentElement!.parentElement!.id;
      var waiting_screen: HTMLDivElement = this.props.indicators!.waiting_screen;
      var success_screen: HTMLDivElement = this.props.indicators!.success_screen;
      
      waiting_screen.style.display = "flex";
      waiting_screen.querySelector("span")!.innerText = "Deleting this expense from database...";

      var db_response: IDatabaseResponse = await this.props.user.functions.Delete_Expense(expense_id);
      
      waiting_screen.style.display = "none";

      if(!db_response.isSuccess) throw db_response;
      
      waiting_screen.style.display = "flex"
      waiting_screen.querySelector("span")!.innerText = "Syncing data...";

      var new_data = await this.props.syncData();

      waiting_screen.style.display = "none";
      success_screen.style.display = "flex";
      success_screen.querySelector("span")!.innerText = db_response.message
      
      this.setState({
        data: new_data.expenses,
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
      <div className='expenses'>
        <Navbar controls={this.state.navbar_btns}></Navbar>
        <table>
          <thead>
            <tr>
              <th>{'Date'}</th>
              <th>{'Amount'}</th>
              <th>{'Category'}</th>
              <th>{'Receipt'}</th>
              <th>{'Notes'}</th>
              <th colSpan={2}>{'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map((item: IExpense) : React.ReactNode => {
              return(
                <tr key={item._id!} id={item._id!}>
                  <td>{`${item.day}.${item.month}.${item.year}`}</td>
                  <td>{`${(Number(item.amount).toFixed(2))} KM`}</td>
                  <td>{item.category}</td>
                  <td>{item.receipt_number}</td>
                  <td>{item.notes}</td>
                  <td title='update'><img src={Pencil} onClick={this.openUpdateExpenseForm} /></td>
                  <td title='delete'><img src={TrashCan} onClick={this.deleteExpense} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className='insert-expense-form' style={{display: this.state.isInsertFormOpen ? 'flex' : 'none'}}>
          <form onSubmit={(e: React.FormEvent) => {this.insertExpense(e)}}>
            <span>Date:</span>
            <input 
              type='date' 
              name='date' 
              value={this.state.insert_form_data.date}
              required
              onChange={this.handleChangeInsert}
            ></input>

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
              list='expense-category-list'
              value={this.state.insert_form_data.category}
              required
              onChange={this.handleChangeInsert}
            ></input>
            
            
            <span>Receipt:</span>
            <input 
              type='text' 
              name='receipt_number' 
              value={this.state.insert_form_data.receipt_number}
              onChange={this.handleChangeInsert}
            ></input>

            <span>Notes:</span>
            <textarea 
              name="notes"
              value={this.state.insert_form_data.notes}
              onChange={this.handleChangeInsert}
            ></textarea>

            <div className='buttons-wrapper'>
              <button type='button' className='cancel' onClick={this.closeInsertExpenseForm}>{'Cancel'}</button>
              <button type='submit' className='submit'>{'Submit'}</button>
            </div>
          </form>

          <datalist id='expense-category-list'>
            {this.generateDataList()}
          </datalist>
        </div>
        <div className='update-expense-form' style={{display: this.state.isUpdateFormOpen ? 'flex' : 'none'}}>
          <form onSubmit={(e: React.FormEvent) => {this.updateExpense(e)}}>
            <span>Date:</span>
            <input 
              type='date' 
              name='date' 
              value={this.state.update_form_data.date}
              required
              onChange={this.handleChangeUpdate}
            ></input>

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
              list='expense-category-list'
              value={this.state.update_form_data.category}
              required
              onChange={this.handleChangeUpdate}
            ></input>

            <span>Receipt:</span>
            <input 
              type='text' 
              name='receipt_number' 
              value={this.state.update_form_data.receipt_number}
              onChange={this.handleChangeUpdate}
            ></input>
            
            <span>Notes:</span>
            <textarea 
              name="notes"
              value={this.state.update_form_data.notes}
              onChange={this.handleChangeUpdate}
            ></textarea>

            <div className='buttons-wrapper'>
              <button type='button' className='cancel' onClick={this.closeUpdateExpenseForm}>{'Cancel'}</button>
              <button type='submit' className='submit'>{'Submit'}</button>
            </div>
          </form>

          <datalist id='expense-category-list'>
            {this.generateDataList()}
          </datalist>
        </div>
      </div>
    )
  }
}
