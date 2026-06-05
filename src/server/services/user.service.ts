import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserSchema } from "../validators/user.schema";
import { AppError } from "@/lib/errors";

export class UserService {
  constructor(private repo: UserRepository) {}

  async register(data: unknown) {
    console.log("A - entrando no register");

    const validated = CreateUserSchema.parse(data);
    console.log("B - validado:", validated);

    const exists = await this.repo.findByEmail(validated.email);
    console.log("C - existe?:", exists);

    if (exists) throw new AppError("E-mail já cadastrado", 409);

    const hashedPassword = await bcrypt.hash(validated.password, 12);
    console.log("D - senha hash gerada");

    const user = await this.repo.create({
      email: validated.email,
      name: validated.name,
      password: hashedPassword,
      phone: validated.phone,
    });

    console.log("E - usuário salvo no banco");

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const { password: _, ...userSafe } = user;
    return userSafe;
  }
}