import { defineAction } from 'astro:actions';
import { z } from 'astro:content';
import { addSubscriber } from '../util/convertkit';
import { inngest } from '../util/inngest';

export const server = {
	user: {
		updateProfile: defineAction({
			accept: 'form',
			input: z.object({
				id: z.string(),
				username: z.string(),
				bio: z.string().optional(),
				'link_label[]': z.array(z.string()),
				'link_url[]': z.array(z.string()),
			}),
			handler: async (input) => {
				const { id, username, bio = '' } = input;
				const link_labels = input['link_label[]'];
				const link_urls = input['link_url[]'];
				const links = link_urls
					.map((url, i) => {
						if (!url) {
							return false;
						}

						return {
							label: link_labels.at(i) ?? '',
							url,
						};
					})
					.filter((val) => val !== false);

				const result = await inngest.send({
					name: 'lwj/user.profile.update',
					data: {
						id: id.toString(),
						username,
						bio,
						links,
					},
				});

				return result;
			},
		}),
	},
	newsletter: {
		subscribe: defineAction({
			accept: 'form',
			input: z.object({
				firstName: z.string(),
				email: z.string().email(),
			}),
			handler: async (input) => {
				const subscriber = await addSubscriber(input.firstName, input.email);

				return subscriber;
			},
		}),
	},
};
