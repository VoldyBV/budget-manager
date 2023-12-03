import React from 'react';
import * as Realm from 'realm-web';
import {IIncome} from './models/income.interface'
import {IExpense} from './models/expense.interface'
import './App.css';
import { app, credentials } from './utilis/mongo.client';
import Preloader from './components/indicators/preloader/Preloader';
import ControlPanel from './components/app_parts/control_panel/ControlPanel';
import Incomes from './components/app_parts/incomes/Incomes';
import Expenses from './components/app_parts/expenses/Expenses';
import Reports from './components/app_parts/reports/Reports';
import WaitingScreen from './components/indicators/waiting_screen/WaitingScreen';
import SuccessScreen from './components/indicators/success_screen/SuccessScreen';

interface AppProps {
}

interface AppState {
  user?: Realm.User,
  incomes: IIncome[],
  expenses: IExpense[],
  indicators?: {
    waiting_screen: HTMLDivElement,
    success_screen: HTMLDivElement
  }
  current_component: React.ReactNode,
  isPreloaderOpen: boolean,
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.switchComponents = this.switchComponents.bind(this);
    this.syncData = this.syncData.bind(this)

    this.state = {
      isPreloaderOpen: true,
      incomes: [],
      expenses: [],
      current_component: <Preloader></Preloader>
    }
  }
  async componentDidMount() {
    var preloader_text: HTMLSpanElement = document.querySelector("#preloader-text")!
    
    preloader_text.innerText = "Starting up..."
    var user: Realm.User = await app.logIn(credentials);

    preloader_text.innerText = "Loading incomes...";
    var incomes: IIncome[] = await user.functions.Get_All_Incomes();

    preloader_text.innerText = "Loading expenses..."
    var expenses: IExpense[] = await user.functions.Get_All_Expenses();

    preloader_text.innerText = "Finishing up..."

    setTimeout(() => {
      this.setState({
        user,
        incomes,
        expenses,
        indicators: {
          waiting_screen: document.querySelector(".waiting-screen")!,
          success_screen: document.querySelector(".success-screen")!
        },
        current_component: <ControlPanel switchComponent={this.switchComponents}></ControlPanel>
      })
    }, 500);
  }
  // switchComponents is method that will be called from control panel component
  // It's purpose is to switch between components 
  // It will also called from other components so that application can return to control panel component
  // For example, it will be called from component Incomes, and application will switch to component Control Panel 
  switchComponents(component_name?: string): void {
    var current_component: React.ReactNode;

    switch(component_name) {
      case "incomes": current_component = 
        <Incomes 
          user={this.state.user!} 
          data={this.state.incomes} 
          indicators={this.state.indicators}
          goToControlPanel={this.switchComponents} 
          syncData={this.syncData}
        ></Incomes>; break;
      case "expenses": current_component = 
        <Expenses
          user={this.state.user!}
          data={this.state.expenses}
          indicators={this.state.indicators}
          goToControlPanel={this.switchComponents}
          syncData={this.syncData}
        ></Expenses>; break;
      case "reports": current_component = 
        <Reports 
          incomes={this.state.incomes}
          expenses={this.state.expenses}
          goToControlPanel={this.switchComponents}
        ></Reports>; break;
      default: current_component = <ControlPanel switchComponent={this.switchComponents}></ControlPanel>;
    }

    this.setState({
      current_component
    })
  }
  // syncData method is used to sync app data to data in database
  // syncData will be called every time after document(s) in databese is/are added, modified or deleted
  // this method will be called from other components
  async syncData(): Promise<any> {
    var user: Realm.User = this.state.user!;
    var incomes: IIncome[] = await user.functions.Get_All_Incomes();
    var expenses: IExpense[] = await user.functions.Get_All_Expenses();
    this.setState({
      incomes,
      expenses,
    });
    return {incomes, expenses}
  }
  render() {
    return (
      <div className="App">
        {this.state.current_component}
        <WaitingScreen></WaitingScreen>
        <SuccessScreen></SuccessScreen>
      </div>
    );
  }
}
