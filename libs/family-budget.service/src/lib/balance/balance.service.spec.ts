import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account, Balance } from '@family-budget/family-budget.model';
import { FindOptionsWhere } from 'typeorm';

describe('BalanceService', () => {
  let service: BalanceService;
  let balances: Array<Balance> = [
    {
      id: '1',
      amount: 45,
      dateTime: new Date(new Date().setDate(new Date().getDate() - 5)),
      activeInd: false
    },
    {
      id: '2',
      amount: 100,
      dateTime: new Date(),
      activeInd: true
    }
  ];
  let account: Account = {
    id: '1',
    name: 'Test Account',
    description: 'Test Account',
    accountType: {
      id: '1',
      name: 'Test Account Type'
    },
    budgets: [],
    balances: balances,
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
        BalanceService,
        {
          provide: getRepositoryToken(Balance),
          useClass: jest.fn(() => ({
            findOne(where: FindOptionsWhere<Balance>) { return balances[0]; },
            save(balance: Balance) { return balance; },
          }))
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get balance by id', async () => {
    const balance = await service.getBalanceById('1');
    expect(balance).toEqual(balances[0]);
  });

  it('should call create balance', async() => {
    const balance = await service.createBalance(account, 100);
    expect(balance).toBeDefined();
  });

  it('should call update balance by id: add 100', async() => {
    jest.spyOn(service, 'getBalanceById').mockImplementation(() => Promise.resolve(balances[1]))
    const balance = await service.updateAddBalanceById('2', 100); //add 100, balance should be 200
    expect(balance).toBeDefined();
    expect(balance.amount).toEqual(200);
  });

  it('should call update balance by id: transaction expense', async() => {
    jest.spyOn(service, 'getBalanceById').mockImplementation(() => Promise.resolve(balances[1]))
    const balance = await service.updateAddBalanceById('2', -50); // expense of 50.00, balance should be 50
    expect(balance).toBeDefined();
    expect(balance.amount).toEqual(50);
  });

  it('should call update latest balance: add 100', async() => {
    jest.spyOn(service, 'getLatestBalance').mockImplementation(() => Promise.resolve(balances[1]));
    const balance = await service.updateAddLatestBalance(account, 100);
    expect(balance).toBeDefined();
    expect(balance.amount).toEqual(200);
  });

  it('should call mark balance inactive', async() => {
    jest.spyOn(service, 'getBalanceById').mockImplementation(() => Promise.resolve(balances[1]));
    const balance = await service.markBalanceAsInactive('2');
    expect(balance).toBeDefined();
    expect(balance.activeInd).toEqual(false);
  });
});
