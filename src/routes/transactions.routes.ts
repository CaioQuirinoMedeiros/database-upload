import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const balance = await transactionsRepository.getBalance();
  const transactions = await transactionsRepository.find();

  return response.send({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.send(transaction);
});

transactionsRouter.delete('/:transactionId', async (request, response) => {
  const { transactionId } = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute(transactionId);

  return response.send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;

    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute(file);

    return response.send(transactions);
  },
);

export default transactionsRouter;
