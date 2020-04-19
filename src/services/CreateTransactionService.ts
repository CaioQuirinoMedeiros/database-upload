import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute(request: Request): Promise<Transaction> {
    const { title, value, type, category } = request;

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (value > balance.total) {
        throw new AppError("That's more that you can handle");
      }
    }

    const findCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    let transaction;

    if (findCategory) {
      transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: findCategory.id,
      });
    } else {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: newCategory.id,
      });
    }

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
