import { IExpense } from "./expense.interface";
import { IIncome } from "./income.interface";

export interface MonthlyIncomeReport {
    data: IIncome[],
    monthly_overview:{
        report_for: string,
        total_amount: number,
    },
    total_income_by_category: {
        category: string,
        total_amount: number,
    }[],
}
export interface MonthlyExpenseReport {
    data: IExpense[],
    monthly_overview:{
        report_for: string,
        days: number,
        budget: number,
        total_amount: number,
        daily_avreage: number,
        the_rest: number,
    },
    total_expense_by_category: {
        category: string,
        total_amount: number,
    }[],
}
export interface YearlyIncomeReport {
    yearly_overview: {
        report_for: string,
        total_amount: number
    },
    total_income_by_month: {
        january: number,
        february: number,
        march: number,
        april: number,
        may: number,
        june: number,
        july: number,
        august: number,
        september: number,
        october: number,
        november: number,
        december: number,
    },
    total_income_by_category: {
        category: string,
        total_amount: number,
    }[],
}
export interface YearlyExpenseReport {
    yearly_overview: {
        report_for: string,
        days: number,
        total_amount: number,
        daily_avreage: number
    },
    total_expense_by_month: {
        january: number,
        february: number,
        march: number,
        april: number,
        may: number,
        june: number,
        july: number,
        august: number,
        september: number,
        october: number,
        november: number,
        december: number,
    },
    total_expense_by_category: {
        category: string,
        total_amount: number,
    }[],
}

// type guards
export const isMonthlyIncomeReport = (obj: any): obj is MonthlyIncomeReport => {
    return (obj as MonthlyIncomeReport).total_income_by_category !== undefined;
};
export const isMonthlyExpenseReport = (obj: any): obj is MonthlyExpenseReport => {
    return (obj as MonthlyExpenseReport).total_expense_by_category !== undefined;
};
export const isYearlyIncomeReport = (obj: any): obj is YearlyIncomeReport => {
    return (obj as YearlyIncomeReport).total_income_by_month !== undefined;
};
export const isYearlyExpenseReport = (obj: any): obj is YearlyExpenseReport => {
    return (obj as YearlyExpenseReport).total_expense_by_month !== undefined;
};
