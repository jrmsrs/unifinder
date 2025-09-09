import type { PageLoad } from './$types';

const fetchUserProfile = async () => {
  return {
    name: 'John Doe',
    bio: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.',
    avatarUrl: 'favicon.svg',
    tags: ['developer', 'frontend', 'svelte']
  };
};

export const load: PageLoad = ({ data }) => {
  return {
    ...data,
    streamed: {
      ...data.streamed,
      userProfile: fetchUserProfile()
    }
  };
};
