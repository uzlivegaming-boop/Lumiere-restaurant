import {
  useUser
} from '@clerk/react';


export function useCurrentUser() {

  const {
    user,
    isLoaded
  } = useUser();


  return {
    user,

    isLoaded,

    isSignedIn:
      isLoaded && !!user,

    displayName:
      user?.firstName ||
      user?.username ||
      'Player',

    email:
      user
        ?.primaryEmailAddress
        ?.emailAddress,

    avatar:
      user?.imageUrl
  };
}