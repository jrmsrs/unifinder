import type { PageLoad } from './$types';

const fetchUserProfile = async () => {
	// 2000ms delay
	await new Promise((resolve) => setTimeout(resolve, 2000));

	return {
		name: 'John Doe',
		bio: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.',
		avatarUrl: 'favicon.svg',
		tags: ['developer', 'frontend', 'svelte']
	};
};

export const load: PageLoad = () => {
	return {
		streamed: {
			userProfile: fetchUserProfile()
		}
	};
};
