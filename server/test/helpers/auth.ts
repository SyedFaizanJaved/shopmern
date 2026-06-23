import { User } from '../../src/models/User';
import { signAccessToken } from '../../src/utils/token';

// Create a real user of the given role and return a signed access token for it.
async function makeToken(role: 'user' | 'admin'): Promise<string> {
  const user = await User.create({
    name: role === 'admin' ? 'Admin' : 'Shopper',
    email: `${role}-${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`,
    password: 'secret123',
    role,
  });
  return signAccessToken({ sub: user.id, role });
}

export const makeAdminToken = () => makeToken('admin');
export const makeUserToken = () => makeToken('user');
