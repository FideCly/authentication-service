/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginResponse, RegisterResponse, ValidateResponse } from '../auth.pb';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../auth.entity';
import {
  LoginRequestDto,
  RegisterRequestDto,
  ValidateRequestDto,
} from '../auth.dto';
import { Repository } from 'typeorm';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  @InjectRepository(Auth)
  private readonly repository: Repository<Auth>;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  public async register({
    email,
    password,
  }: RegisterRequestDto): Promise<RegisterResponse> {
    if (await this.repository.findOne({ where: { email } }))
      return { status: HttpStatus.CONFLICT, error: ['E-Mail already exists'] };

    const auth: Auth = {
      ...new Auth(),
      email: email,
      password: this.jwtService.encodePassword(password),
    };

    await this.repository.save(auth);
    return { status: HttpStatus.CREATED, error: [] };
  }

  public async login({
    email,
    password,
  }: LoginRequestDto): Promise<LoginResponse> {
    const auth = await this.repository.findOne({ where: { email } });

    if (!auth) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: ['E-Mail not found'],
        token: '',
      };
    }

    if (!this.jwtService.isPasswordValid(password, auth.password)) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: ['Password is wrong'],
        token: '',
      };
    }

    const token: string = this.jwtService.generateToken(auth);
    return { token, status: HttpStatus.OK, error: [] };
  }

  public async validate({
    token,
  }: ValidateRequestDto): Promise<ValidateResponse> {
    try {
      const decoded: Auth = await this.jwtService.verify(token);

      const auth = await this.jwtService.validateUser(decoded);
      if (!auth) {
        return {
          status: HttpStatus.CONFLICT,
          error: ['User not found'],
          userId: -1,
        };
      }

      return { status: HttpStatus.OK, error: [], userId: decoded.id };
    } catch (error) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: ['Token is invalid'],
        userId: -1,
      };
    }
  }
}
