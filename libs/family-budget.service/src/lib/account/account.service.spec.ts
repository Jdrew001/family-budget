import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account, User } from '@family-budget/family-budget.model';
import { FindOptionsWhere } from 'typeorm';

describe('AccountService', () => {
  let service: AccountService;
  const account: Account = {
    id: '1',
    name: 'Test Account',
    description: 'Test Account',
    accountType: {
        id: '1',
        name: 'Test Account Type'
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
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useClass: jest.fn(() => ({
              find(where: FindOptionsWhere<User>) { return [account] }
          }))
        },
        {
          provide: getRepositoryToken(User),
          useClass: jest.fn(() => ({
            findOne(where: FindOptionsWhere<Account>) { return {}; }
          }))
        }
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get accounts for user', async () => {
    const accounts = await service.getAccountsUserUser('1');
    expect(accounts).toBeDefined();
    expect(accounts.length).toBe(1);
    expect(accounts[0].id).toBe('1');
  });

  it('should get account balance for user', async () => {
    account.balances = [
      {
        id: '1',
        amount: 40.00,
        dateTime: new Date('2023-02-28')
      },
      {
        id: '2',
        amount: 100.00,
        dateTime: new Date()
      }
    ]

    const balances = await service.getAccountBalancesForUser('1');
    expect(balances).toBeDefined();
    expect(balances.length).toBe(1);
    expect(balances[0].accountId).toBe('1');
    expect(balances[0].accountName).toBe('Test Account');
    expect(balances[0].balance.amount).toBe(100.00);
  });

  it('should get account balance for user: data is messed up', async () => {
    account.balances = [
      {
        id: '1',
        amount: 100.00,
        dateTime: new Date()
      },
      {
        id: '2',
        amount: 40.00,
        dateTime: new Date('2023-02-28')
      }
    ]

    const balances = await service.getAccountBalancesForUser('1');
    expect(balances).toBeDefined();
    expect(balances.length).toBe(1);
    expect(balances[0].accountId).toBe('1');
    expect(balances[0].accountName).toBe('Test Account');
    expect(balances[0].balance.amount).toBe(100.00);
  });
});
