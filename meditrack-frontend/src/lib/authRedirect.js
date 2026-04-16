/** Where to send a user after login/register, based on backend role strings. */
export function getPostLoginPath(role) {
  if (role === 'shop_owner' || role === 'admin') return '/dashboard/shop';
  return '/dashboard/patient';
}
