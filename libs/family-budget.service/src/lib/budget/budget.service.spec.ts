import { Test, TestingModule } from '@nestjs/testing';
import { BudgetService } from './budget.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account, Budget } from '@family-budget/family-budget.model';
import { FindOptionsWhere } from 'typeorm';

describe('BudgetService', () => {
  let service: BudgetService;
  const currentDate = new Date(new Date().setDate(new Date().getDate() - 5));
  const futureDate = new Date(new Date().setDate(new Date().getDate() + 5));
  const budgets: Array<Budget> = [
    {
      id: '1',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-01-31'),
      budgetCategories: [],
      activeInd: true
    },
    {
      id: '2',
      startDate: new Date('2020-02-01'),
      endDate: new Date('2020-02-28'),
      budgetCategories: [],
      activeInd: true
    },
    {
      id: '3',
      startDate: currentDate,
      endDate: futureDate,
      budgetCategories: [],
      activeInd: true
    }
]
  const account: Account = {
      id: '1',
      name: 'Test Account',
      description: 'Test Account',
      accountType: {
          id: '1',
          name: 'Test Account Type',
          sortOrder: 0
      },
      budgets: budgets as Array<Budget>,
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
        BudgetService,
        {
          provide: getRepositoryToken(Budget),
          useClass: jest.fn(() => ({
              
          }))
        },
        {
            provide: getRepositoryToken(Account),
            useClass: jest.fn(() => ({
                findOneBy(where: FindOptionsWhere<Account>) { return account; }
            }))
        }
      ],
    }).compile();

    service = module.get<BudgetService>(BudgetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the current budget', async () => {
    let result = await service.getCurrentBudget(account) as Budget;
    expect(result.id).toEqual('3');
  });

  it('should return the budgets for the current date', async () => {
    account.transactions = [
      {
        id: '1',
        description: 'Test Transaction',
        category: {
          id: '1',
          name: 'Groceries',
          type: 1
        },
        account: account,
        amount: 50,
        createdBy: '1',
        budget: budgets[2]
      }
    ];
    budgets[2].budgetCategories = [
        {
            id: '1',
            amount: 300,
            budget: budgets[2],
            category: {
                id: '1',
                name: 'Paycheck',
                type: 0
            }
        },
        {
          id: '1',
          amount: 100,
          budget: budgets[2],
          category: {
              id: '1',
              name: 'Groceries',
              type: 1
          }
      }
    ];
    let result = await service.getWhatsLeftToSpend(account) as number;
    expect(result).toEqual(50);
  });

  it('should get total income expense for budget', async () => {
    account.transactions = [
      {
        id: '1',
        description: 'Test Transaction',
        category: {
          id: '2',
          name: 'Groceries',
          type: 1
        },
        account: account,
        amount: 50,
        createdBy: '1',
        budget: budgets[2]
      },
      {
        id: '1',
        description: 'Test Transaction',
        category: {
          id: '1',
          name: 'Paycheck',
          type: 0
      },
        account: account,
        amount: 100,
        createdBy: '1',
        budget: budgets[2]
      }
    ];
    let result = await service.getTotalIncomeExpenseForBudget(account);
    expect(result).toEqual({totalIncome: 100, totalExpense: 50});
  });
});
