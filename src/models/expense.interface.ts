export interface IExpense {
    _id?: string,
    year: string,
    month: string,
    day: string,
    amount: string,
    category: string,
    notes?: string,
    receipt_number?: string
}