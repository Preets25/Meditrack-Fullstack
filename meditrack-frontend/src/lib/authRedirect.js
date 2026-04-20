/** Where to send a user after login/register, based on backend role strings. */
export function getPostLoginPath(role) {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'shop_owner') return '/dashboard/shop';
  return '/dashboard/patient';
}
