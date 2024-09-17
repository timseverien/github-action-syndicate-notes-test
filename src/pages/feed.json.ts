import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection } from 'astro:content';
import { SITE_NAME } from '../config';

export const GET: APIRoute = async () => {
	const container = await AstroContainer.create();
	const notes = await getCollection('notes');

	const items = await Promise.all(
		notes.map(async (note) => {
			const { Content } = await note.render();
			const content = await container.renderToString(Content);

			return {
				id: note.slug,
				title: note.data.title,
				content_html: content.replace(/^<!DOCTYPE html>/, '').trim(),
				date_published: note.data.pubDate.toISOString(),
			};
		}),
	);

	return new Response(
		JSON.stringify({
			version: 'https://jsonfeed.org/version/1.1',
			title: SITE_NAME,
			items,
		}),
	);
};
