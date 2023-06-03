import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService as Jwt } from '@nestjs/jwt';
import { Auth } from '../entities/auth.entity';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export class JwtService {
  constructor(
    private readonly jwt: Jwt,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}
  //  decoding the jwt token
  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token, null);
  }
  // get user by user id we get from decode()
  public async validateUser(decode: any): Promise<Auth> {
    const user = await this.prisma.user.findUnique({
      where: { id: decode.id },
    });
    return user;
  }
  // generate token
  public generateToken(auth: Auth): string {
    const token = this.jwt.sign({ id: auth.id, email: auth.email });
    return token;
  }
  // verify password
  public isPasswordValid(password: string, userPassword): boolean {
    const validate = bcrypt.compareSync(password, userPassword);
    return validate;
  }
  // encode password
  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  }

  // verify token
  public async verifyToken(token: string): Promise<any> {
    try {
      const decode = await this.jwt.verifyAsync(token);
      return decode;
    } catch (err) {}
  }
}
