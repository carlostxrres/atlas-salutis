import { getCollection, type CollectionEntry } from 'astro:content';

export async function getAllPosts() {
  const docs = await getCollection('docs');
  return docs.filter((entry) => entry.id.startsWith('posts/'));
}

type PostEntry = CollectionEntry<'docs'>;
type PostSource = PostEntry['data']['sources'][number];

// Every (post, source) pair whose `personIds` cites the given person. A single
// post can cite the same person more than once, so this can exceed the number
// of distinct posts returned by getPostsForPerson.
export async function getPersonReferences(
  personId: string,
): Promise<{ post: PostEntry; source: PostSource }[]> {
  const posts = await getAllPosts();
  return posts.flatMap((post) =>
    post.data.sources
      .filter((source) => source.personIds.includes(personId))
      .map((source) => ({ post, source })),
  );
}

export async function getPersonReferenceCount(personId: string): Promise<number> {
  return (await getPersonReferences(personId)).length;
}

export async function getPostsForPerson(personId: string): Promise<PostEntry[]> {
  const refs = await getPersonReferences(personId);
  return [...new Map(refs.map((ref) => [ref.post.id, ref.post])).values()];
}

export async function getInterviewsForPerson(personId: string) {
  const interviews = await getCollection('interviews');
  return interviews.filter(
    (interview) =>
      interview.data.interviewees.some((ref) => ref.id === personId) ||
      interview.data.interviewers.some((ref) => ref.id === personId),
  );
}
