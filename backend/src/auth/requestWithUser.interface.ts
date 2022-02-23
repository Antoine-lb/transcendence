import { Request } from 'express';
import { UserEntity } from '../entities/users.entity';
 
interface RequestWithUser extends Request {
  user: UserEntity;
}
 
export default RequestWithUser;