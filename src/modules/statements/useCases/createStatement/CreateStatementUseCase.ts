import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, type, sender_id, amount, description }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if(type !== 'deposit') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    if (type === 'transfer') {
      const sender = (!sender_id ? null : sender_id);

      const statementOperation = await this.statementsRepository.create({
        user_id: sender as string,
        sender_id: user.id as string,
        type,
        amount,
        description
      });

      await this.statementsRepository.create({
        user_id,
        sender_id,
        type: 'withdraw' as any,
        amount,
        description: `Transfer - ${description}`
      });

      return statementOperation;
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id: null,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
