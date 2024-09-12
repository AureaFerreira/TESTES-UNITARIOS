import request from 'supertest';
import { App } from '../../../src/app';
import { IUserResponse } from '../../../src/interfaces/IUserResponse';
import { UserRepository } from '../../../src/endpoints/users/userRepository';
import {IUser} from "../../../src/interfaces/IUser";

// Cria uma instância da aplicação para executar os testes
const app = new App().server.listen(8081);

describe('UserController', () => {
  afterAll((done) => {
    // Fechar o servidor após os testes
    app.close(done);
  });
//O Mock simular o comportamento de objetos
  it('Deve retornar a lista de usuários corretamente', async () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        name: 'Naruto',
        age: 10,
      },
      {
        id: 2,
        name: 'Sasuke',
        age: 18, 
      },
      {
        id: 3,
        name: 'Kakashi',
        age: 50,
      },
    ];

//meio q verifica se a idade é maior q 18 igual no metodo passado
    const expectedUsers: IUserResponse[] = [
      {
        id: 1,
        name: 'Naruto',
        age: 10,
        isOfAge: false,
      },
      {
        id: 2,
        name: 'Sasuke',
        age: 18,
        isOfAge: true,
      },
      {
        id: 3,
        name: 'Kakashi',
        age: 50,
        isOfAge: true,
      },
    ];
//prototype só define na origem da classe, para mockar só nessa requisição
//mockReturnValueOnce - mocker somentente uma vez
    jest.spyOn(UserRepository.prototype, 'list').mockReturnValueOnce(mockUsers);

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);//espera q a requisição seja 200 no caso ok p/ q não quebre, a portaa é passada no USerController
    expect(response.body.success).toBe(true);//garantir q com aquela entrada de dados o retorno seja sempre 200 q ela de certo
    expect(response.body.data).toEqual(expectedUsers);// o data são os dados esperados, muda o tobe pq não serão dados primitivos
  });

  it('Deve retornar um usuário corretamente', async () => {
    const mockUser: IUser = {
      id: 1,
      name: 'Naruto',
      age: 10,
    };

    const expectedUser: IUserResponse = {
      id: 1,
        name: 'Naruto',
        age: 10,
        isOfAge: false,
    };


  jest.spyOn(UserRepository.prototype, 'findOne').mockReturnValueOnce(mockUser);

    const response = await request(app).get('/users/1');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectedUser);
  });

  it('Deve retornar um erro ao tentar buscar um usuário inexistente', async () => {
    jest.spyOn(UserRepository.prototype, 'findOne').mockReturnValueOnce(undefined);

    const response = await request(app).get('/users/100000');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBe('Usuário não encontrado');
  })

  it('Deve criar um usuário corretamente', async () => {
      const mockUser: IUser = {
      id: 1,
      name: 'Naruto',
      age: 10,
      };

      jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(true);

      const response = await request(app).post('/users').send(mockUser);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe('Usuário criado com sucesso');
  });

  it('Deve retornar um erro ao tentar criar um usuário com id já existente', async () => {
      const mockUser: IUser = {
      id: 1,
      name: 'Naruto',
      age: 10,
      };

      jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(false);

      const response = await request(app).post('/users').send(mockUser);
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe('Falha ao criar o usuário');
  });

  it('Deve deletar um usuário corretamente', async () => {
      jest.spyOn(UserRepository.prototype, 'delete').mockReturnValueOnce(true);

      const response = await request(app).delete('/users/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
  });

  it('Deve retornar um erro ao tentar deletar um usuário inexistente', async () => {
        jest.spyOn(UserRepository.prototype, 'delete').mockReturnValueOnce(false);

        const response = await request(app).delete('/users/100000');
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
  });
});
