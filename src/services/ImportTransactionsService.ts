import { Express } from 'express';
import parse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface DataRow {
  title: string;
  type: 'outcome' | 'income';
  value: number;
  category: string;
}

const getRows = (filePath: string): Promise<DataRow[]> =>
  new Promise(resolve => {
    const rows: DataRow[] = [];

    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, ltrim: true }))
      .on('data', async row => {
        rows.push(row);
      })
      .on('end', () => {
        resolve(rows);
      });
  });

class ImportTransactionsService {
  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const rows = await getRows(file.path);

    const transactions: Transaction[] = [];

    await Promise.all(
      rows.map(async row => {
        const transaction = await createTransactionService.execute(row);

        transactions.push(transaction);
      }),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
