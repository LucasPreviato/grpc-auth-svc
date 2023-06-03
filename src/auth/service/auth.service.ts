import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from './jwt.service';
import { LoginRequestDto, RegistrerRequestDto } from '../dtos/auth.dto';
import {
  LoginResponse,
  RegisterResponse,
  ValidateRequest,
  ValidateResponse,
} from '../auth.pb';
import { Auth } from '../entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,

    private readonly prisma: PrismaService,
  ) {}

  public async register({
    email,
    password,
  }: RegistrerRequestDto): Promise<RegisterResponse> {
    let auth: Auth = await this.prisma.user.findUnique({
      where: { email },
    });
    if (auth) {
      return { status: HttpStatus.CONFLICT, error: ['Email already exists'] };
    }

    auth = new Auth();

    auth.email = email;
    auth.password = this.jwtService.encodePassword(password);

    await this.prisma.user.create({ data: auth });
    return { status: HttpStatus.CREATED, error: null };
  }

  public async login({
    email,
    password,
  }: LoginRequestDto): Promise<LoginResponse> {
    const auth: Auth = await this.prisma.user.findUnique({
      where: { email },
    });

    const isPasswordValid: boolean = this.jwtService.isPasswordValid(
      password,
      auth.password,
    );

    if (!isPasswordValid) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        error: ['User not authorized'],
        token: null,
      };
    }
    const token: string = this.jwtService.generateToken(auth);
    return { status: HttpStatus.OK, error: null, token };
  }

  public async validate({ token }: ValidateRequest): Promise<ValidateResponse> {
    const decoded: Auth = await this.jwtService.verifyToken(token);
    if (!decoded) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: ['Token not valid'],
        userId: null,
      };
    }
    const auth: Auth = await this.jwtService.validateUser(decoded);

    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        error: ['User not found'],
        userId: null,
      };
    }
    return {
      status: HttpStatus.OK,
      error: null,
      userId: decoded.id,
    };
  }
}
