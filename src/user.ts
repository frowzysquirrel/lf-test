import { ref } from 'vue';
import constants from './constants';
import { useCookies } from 'vue3-cookies';
import { User } from './types';

// Custom composable function to get user data and check if user is admin
export function useUser() {
  const { cookies } = useCookies();

  // Define a reactive ref for user data
  const user = ref<User | null>(null);

  // Get user data from cookies and set it to the reactive ref
  const getUser = () => {
    user.value = <User>(<unknown>cookies.get(constants.lf_user));
  };

  // Check if user is admin based on user data
  const isAdmin = () => {
    getUser(); // Ensure user data is updated
    return user.value ? ['flashforce', 'frowzysquirrel'].includes(user.value.login) : false;
  };

  // Initial call to getUser when the component is mounted
  getUser();

  // Return the reactive ref and isAdmin function to be used in components
  return {
    user,
    isAdmin,
  };
}
