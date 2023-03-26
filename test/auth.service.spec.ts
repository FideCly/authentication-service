import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/service/auth.service';
import { jwtConstants } from '../src/auth/constants';
import { HttpStatus } from '@nestjs/common';
import { Auth } from '../src/auth/auth.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '../src/auth/service/jwt.service';
import {
  authFixture,
  incorrectLoginFixture,
  loginFixture,
  registerFixture,
} from './auth.fixture';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<Auth>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        AuthService,
        JwtService,
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    repository = moduleRef.get<Repository<Auth>>(getRepositoryToken(Auth));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register()', () => {
    it('should return conflict error when email already exists', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ ...new Auth(), ...authFixture });

      const res = await service.register(registerFixture);
      expect(res.status).toEqual(HttpStatus.CONFLICT);
      expect(res.error.length).toEqual(1);
      expect(res.error[0]).toBe('E-Mail already exists');
    });

    it('should return created status when credentials are valid', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const res = await service.register(registerFixture);
      expect(res.status).toEqual(HttpStatus.CREATED);
      expect(res.error.length).toEqual(0);
    });
  });

  describe('login()', () => {
    it("should return not found error when user doesn't exist", async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const res = await service.login(loginFixture);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      expect(res.error.length).toEqual(1);
      expect(res.error[0]).toBe('E-Mail not found');
    });

    it('should return not found error when credentials are invalid', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ ...new Auth(), ...authFixture });

      const res = await service.login(incorrectLoginFixture);
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      expect(res.error.length).toEqual(1);
      expect(res.error[0]).toBe('Password is wrong');
      expect(res.token.length).toBe(0);
    });

    it('should return JWT object when credentials are valid', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ ...new Auth(), ...authFixture });

      const res = await service.login(loginFixture);
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.error.length).toEqual(0);
      expect(res.token.length).toBeGreaterThan(0);
    });
  });

  describe('validate()', () => {
    it('should return a user object when credentials are valid', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ ...new Auth(), ...authFixture });
      const loginRes = await service.login(loginFixture);

      const res = await service.validate({
        token: loginRes.token,
      });
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.userId).toEqual(1);
      expect(res.error.length).toEqual(0);
    });

    it('should return error when credentials are invalid', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ ...new Auth(), ...authFixture });

      const res = await service.validate({
        token: 'xxxxx',
      });
      expect(res.status).toEqual(HttpStatus.FORBIDDEN);
      expect(res.userId).toEqual(-1);
      expect(res.error.length).toEqual(1);
      expect(res.error[0]).toBe('Token is invalid');
    });
  });
});
