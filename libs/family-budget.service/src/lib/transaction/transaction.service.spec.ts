import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsWhere } from 'typeorm';
import { BalanceService } from '../balance/balance.service';
import { AccountService } from '../account/account.service';
import { jest } from '@jest/globals';
import { Account, Balance, Budget, Transaction, User } from '@family-budget/family-budget.model';

describe('TransactionService', () => {
  let service: TransactionService;
  let accountService: AccountService;
  let balanceService: BalanceService;

  //#region mock transaction object
  const transaction: Transaction = {
    id: '1',
    amount: 100,
    description: 'Test Transaction',
    category: {
      id: '1',
      name: 'Test Category',
      type: 1
    },
    account: {
      id: '1',
      name: 'Test Account',
      description: 'Test Account',
      accountType: {
        id: '1',
        name: 'Test Account Type',
        sortOrder: 0
      },
      budgets: [],
      balances: [],
      transactions: [],
      budgetPeriod: {
        id: '1',
        frequency: 1
      },
      family: {
        id: '1',
        users: [
          {
            id: '1',
            firstname: 'Test',
            lastname: 'User',
            email: '',
            password: '',
            salt: '',
            confirmed: true
          }
        ]
      },
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
  //#endregion

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        BalanceService,
        AccountService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: jest.fn(() => ({
            findOne(where: FindOptionsWhere<Transaction>) { return transaction; },
            find(where: FindOptionsWhere<Transaction>) { return [transaction]; },
            save(transaction: Transaction) { return transaction; },
            delete(where: FindOptionsWhere<Transaction>) { return undefined; }
          }))
        },
        {
          provide: getRepositoryToken(Balance),
          useClass: jest.fn(() => ({
              
          }))
        },
        {
          provide: getRepositoryToken(Account),
          useClass: jest.fn(() => ({
              
          }))
        },
        {
          provide: getRepositoryToken(User),
          useClass: jest.fn(() => ({
            
          }))
        },
        {
          provide: getRepositoryToken(Budget),
          useClass: jest.fn(() => ({
            
          }))
        }
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    accountService = module.get<AccountService>(AccountService);
    balanceService = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call get transaction by id', async () => {
    const transaction = await service.getTransactionById('1') as Transaction;
    expect(transaction).toBeDefined();
    expect(transaction.id).toEqual('1');
  });

  it('should call get transactions for account', async () => {
    jest.spyOn(accountService, 'getAccountById').mockImplementation((accountId: string) => Promise.resolve(transaction.account));
    const transactions = await service.getTransactionsForAccount('1') as Array<Transaction>;
    expect(transactions).toBeDefined();
    expect(transactions.length).toEqual(1);
  });

  it('should call create transaction', async () => {
    jest.spyOn(accountService, 'getAccountById').mockImplementation((accountId: string) => Promise.resolve(transaction.account));
    jest.spyOn(balanceService, 'updateAddLatestBalance').mockImplementation((account: Account, amount: number) => Promise.resolve(new Balance()));
    const newTransaction = await service.createTransaction(transaction, '1') as Transaction;
    expect(newTransaction).toBeDefined();
    expect(newTransaction.id).toEqual('1');
  });

  it('should call update transaction', async() => {
    jest.spyOn(service, 'getTransactionById').mockImplementation((transactionId: string) => Promise.resolve(transaction));
    jest.spyOn(balanceService, 'updateAddLatestBalance').mockImplementation((account: Account, amount: number) => Promise.resolve(new Balance()));
    const updatedTransaction = await service.updateTransaction(transaction) as Transaction;
    expect(updatedTransaction).toBeDefined();
    expect(updatedTransaction.id).toEqual('1');
  });

  it('should call delete transaction', async () => {
    jest.spyOn(service, 'getTransactionById').mockImplementation((transactionId: string) => Promise.resolve(transaction));
    const deletedTransaction = await service.deleteTransaction('1');
    expect(deletedTransaction).toEqual(undefined);
  });

  it('should call get recent transactions for account', async () => {
    jest.spyOn(accountService, 'getAccountById').mockImplementation((accountId: string) => Promise.resolve(transaction.account));
    const transactions = await service.getRecentTransactionsForAccount('1', 5) as Array<Transaction>;
    expect(transactions).toBeDefined();
    expect(transactions.length).toEqual(0);
  });
});
