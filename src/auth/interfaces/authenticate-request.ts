import { User } from 'src/user/schemas/user.schema';

export interface IAuthenticatedRequest extends Request {
  user: User;
}
