import { MongoUserRepository } from '../repositories/MongoUserRepository';
import { MongoConversationRepository } from '../repositories/MongoConversationRepository';
import { MongoMessageRepository } from '../repositories/MongoMessageRepository';
import { CreateUserUseCase } from '@application/use-cases/CreateUserUseCase';
import { AuthenticateUserUseCase } from '@application/use-cases/AuthenticateUserUseCase';
import { GetUsersUseCase } from '@application/use-cases/GetUsersUseCase';
import { CreateConversationUseCase } from '@application/use-cases/CreateConversationUseCase';
import { GetConversationsUseCase } from '@application/use-cases/GetConversationsUseCase';
import { CreateMessageUseCase } from '@application/use-cases/CreateMessageUseCase';
import { GetMessagesUseCase } from '@application/use-cases/GetMessagesUseCase';
import { UserController } from '@presentation/controllers/UserController';
import { ConversationController } from '@presentation/controllers/ConversationController';

export class Container {
  private static instance: Container;
  
  // Repositorios
  private _userRepository: MongoUserRepository | undefined;
  private _conversationRepository: MongoConversationRepository | undefined;
  private _messageRepository: MongoMessageRepository | undefined;
  
  // Casos de uso - Users
  private _createUserUseCase: CreateUserUseCase | undefined;
  private _authenticateUserUseCase: AuthenticateUserUseCase | undefined;
  private _getUsersUseCase: GetUsersUseCase | undefined;
  
  // Casos de uso - Conversations
  private _createConversationUseCase: CreateConversationUseCase | undefined;
  private _getConversationsUseCase: GetConversationsUseCase | undefined;
  private _createMessageUseCase: CreateMessageUseCase | undefined;
  private _getMessagesUseCase: GetMessagesUseCase | undefined;
  
  // Controladores
  private _userController: UserController | undefined;
  private _conversationController: ConversationController | undefined;

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Repositorios
  get userRepository(): MongoUserRepository {
    if (!this._userRepository) {
      this._userRepository = new MongoUserRepository();
    }
    return this._userRepository;
  }

  get conversationRepository(): MongoConversationRepository {
    if (!this._conversationRepository) {
      this._conversationRepository = new MongoConversationRepository();
    }
    return this._conversationRepository;
  }

  get messageRepository(): MongoMessageRepository {
    if (!this._messageRepository) {
      this._messageRepository = new MongoMessageRepository();
    }
    return this._messageRepository;
  }

  // Casos de uso - Users
  get createUserUseCase(): CreateUserUseCase {
    if (!this._createUserUseCase) {
      this._createUserUseCase = new CreateUserUseCase(this.userRepository);
    }
    return this._createUserUseCase;
  }

  get authenticateUserUseCase(): AuthenticateUserUseCase {
    if (!this._authenticateUserUseCase) {
      this._authenticateUserUseCase = new AuthenticateUserUseCase(this.userRepository);
    }
    return this._authenticateUserUseCase;
  }

  get getUsersUseCase(): GetUsersUseCase {
    if (!this._getUsersUseCase) {
      this._getUsersUseCase = new GetUsersUseCase(this.userRepository);
    }
    return this._getUsersUseCase;
  }

  // Casos de uso - Conversations
  get createConversationUseCase(): CreateConversationUseCase {
    if (!this._createConversationUseCase) {
      this._createConversationUseCase = new CreateConversationUseCase(
        this.conversationRepository,
        this.userRepository
      );
    }
    return this._createConversationUseCase;
  }

  get getConversationsUseCase(): GetConversationsUseCase {
    if (!this._getConversationsUseCase) {
      this._getConversationsUseCase = new GetConversationsUseCase(this.conversationRepository);
    }
    return this._getConversationsUseCase;
  }

  get createMessageUseCase(): CreateMessageUseCase {
    if (!this._createMessageUseCase) {
      this._createMessageUseCase = new CreateMessageUseCase(
        this.messageRepository,
        this.conversationRepository
      );
    }
    return this._createMessageUseCase;
  }

  get getMessagesUseCase(): GetMessagesUseCase {
    if (!this._getMessagesUseCase) {
      this._getMessagesUseCase = new GetMessagesUseCase(
        this.messageRepository,
        this.conversationRepository
      );
    }
    return this._getMessagesUseCase;
  }

  // Controladores
  get userController(): UserController {
    if (!this._userController) {
      this._userController = new UserController(
        this.createUserUseCase,
        this.authenticateUserUseCase,
        this.getUsersUseCase
      );
    }
    return this._userController;
  }

  get conversationController(): ConversationController {
    if (!this._conversationController) {
      this._conversationController = new ConversationController(
        this.createConversationUseCase,
        this.getConversationsUseCase,
        this.createMessageUseCase,
        this.getMessagesUseCase
      );
    }
    return this._conversationController;
  }
} 