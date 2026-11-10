import type { APIRequestContext } from '@playwright/test';

import { expect, Fixture, Given, Then, When, Step } from '@world';

import { setLastResponse } from '../utils/response-tracker';
import { ResponseVerifier } from '../utils/response-verifier';

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

@Fixture('TodosService')
export class TodosService {
  constructor(private request: APIRequestContext) {}

  private readonly todosEndpoint = '/todos';
  private readonly todoByIdEndpoint = (id: number) => `/todos/${id}`;
  private readonly todosByUserEndpoint = (userId: number) => `/users/${userId}/todos`;

  private lastResponse:
    | Awaited<
        ReturnType<
          | APIRequestContext['get']
          | APIRequestContext['post']
          | APIRequestContext['put']
          | APIRequestContext['delete']
        >
      >
    | undefined;
  private lastTodos: Todo[] | undefined;
  private lastTodo: Todo | undefined;

  @Given('I retrieve all todos')
  async getAllTodos(): Promise<void> {
    const response = await this.request.get(this.todosEndpoint);
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastTodos = await response.json();
  }

  @Given('I retrieve todo with ID {int}')
  async getTodoById(id: number): Promise<void> {
    const response = await this.request.get(this.todoByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastTodo = await response.json();
  }

  @Given('I retrieve todos for user {int}')
  async getTodosByUser(userId: number): Promise<void> {
    const response = await this.request.get(this.todosByUserEndpoint(userId));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastTodos = await response.json();
  }

  @Given('todo with ID {int} exists')
  async verifyTodoExists(id: number): Promise<void> {
    await this.getTodoById(id);
  }

  @When('I create a new todo for user {int} with title {string}')
  async createTodo(userId: number, title: string): Promise<void> {
    const response = await this.request.post(this.todosEndpoint, {
      data: { userId, title, completed: false },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseStatus(response, 201);
    this.lastTodo = await response.json();
  }

  @When('I update todo {int} with title {string} and completed {string}')
  async updateTodo(id: number, title: string, completed: string): Promise<void> {
    const isCompleted = completed.toLowerCase() === 'true';
    const response = await this.request.put(this.todoByIdEndpoint(id), {
      data: { id, userId: 1, title, completed: isCompleted },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastTodo = await response.json();
  }

  @When('I delete todo {int}')
  async deleteTodo(id: number): Promise<void> {
    const response = await this.request.delete(this.todoByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
  }

  @Then('I should receive a list of todos')
  async verifyTodosList(): Promise<void> {
    if (!this.lastTodos) {
      throw new Error('No todos retrieved. Call "I retrieve all todos" first.');
    }
    await this.iVerifyTodosList(this.lastTodos);
  }

  @Then('the todo should have ID {int}')
  async verifyTodoId(expectedId: number): Promise<void> {
    if (!this.lastTodo) {
      throw new Error('No todo retrieved. Call "I retrieve todo with ID" first.');
    }
    await this.iVerifyTodoId(this.lastTodo, expectedId);
  }

  @Then('the todo should have title {string}')
  async verifyTodoTitle(expectedTitle: string): Promise<void> {
    if (!this.lastTodo) {
      throw new Error('No todo retrieved. Perform a todo operation first.');
    }
    await this.iVerifyTodoTitle(this.lastTodo, expectedTitle);
  }

  @Then('the todo should be completed')
  async verifyTodoCompleted(): Promise<void> {
    if (!this.lastTodo) {
      throw new Error('No todo retrieved. Perform a todo operation first.');
    }
    await this.iVerifyTodoCompleted(this.lastTodo);
  }

  @Then('each todo should have id, userId, title, and completed')
  async verifyTodosStructure(): Promise<void> {
    if (!this.lastTodos) {
      throw new Error('No todos retrieved. Call "I retrieve all todos" first.');
    }
    await this.iVerifyTodosStructure(this.lastTodos);
  }

  @Step
  private async iVerifyTodosList(todos: Todo[]): Promise<void> {
    expect(Array.isArray(todos)).toBeTruthy();
    expect(todos.length).toBeGreaterThan(0);
  }

  @Step
  private async iVerifyTodoId(todo: Todo, expectedId: number): Promise<void> {
    expect(todo).toHaveProperty('id');
    expect(todo.id).toBe(expectedId);
  }

  @Step
  private async iVerifyTodoTitle(todo: Todo, expectedTitle: string): Promise<void> {
    expect(todo).toHaveProperty('title');
    expect(todo.title).toBe(expectedTitle);
  }

  @Step
  private async iVerifyTodoCompleted(todo: Todo): Promise<void> {
    expect(todo).toHaveProperty('completed');
    expect(typeof todo.completed).toBe('boolean');
    expect(todo.completed).toBe(true);
  }

  @Step
  private async iVerifyTodosStructure(todos: Todo[]): Promise<void> {
    for (const todo of todos) {
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('userId');
      expect(todo).toHaveProperty('title');
      expect(todo).toHaveProperty('completed');
      expect(typeof todo.id).toBe('number');
      expect(typeof todo.userId).toBe('number');
      expect(typeof todo.title).toBe('string');
      expect(typeof todo.completed).toBe('boolean');
    }
  }
}
