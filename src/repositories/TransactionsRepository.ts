import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    return transactions.reduce(
      (acc, transaction) => {
        const { value, type } = transaction;

        if (type === 'income') {
          return {
            ...acc,
            income: acc.income + value,
            total: acc.total + value,
          };
        }

        return {
          ...acc,
          outcome: acc.outcome + value,
          total: acc.total - value,
        };
      },
      { income: 0, outcome: 0, total: 0 },
    );
  }
}

export default TransactionsRepository;
