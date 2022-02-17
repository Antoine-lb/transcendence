import { Request } from 'express';
import { UserEntity } from '../users/users.entity';
 
interface RequestWithUser extends Request {
  user: UserEntity;
}
 
export default RequestWithUser;