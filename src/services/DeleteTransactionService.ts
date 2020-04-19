import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(transactionId: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(transactionId);

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
