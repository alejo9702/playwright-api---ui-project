import { test, expect } from '@playwright/test';
import { ApiHelper } from '../utils/api-helper';
import { testPosts, Post } from '../fixtures/test-data';

test.describe('Posts API Tests', () => {
  let apiHelper: ApiHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  test.describe('GET /posts', () => {
    test('@api @smoke should get all posts', async () => {
      const response = await apiHelper.get('/posts');
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseArrayLength(response, 100);
      
      const posts = await response.json();
      expect(posts[0]).toHaveProperty('id');
      expect(posts[0]).toHaveProperty('title');
      expect(posts[0]).toHaveProperty('body');
      expect(posts[0]).toHaveProperty('userId');
    });

    test('@api should get posts by user id', async () => {
      const userId = 1;
      const response = await apiHelper.get(`/posts?userId=${userId}`);
      
      await apiHelper.expectStatus(response, 200);
      
      const posts = await response.json();
      expect(posts.length).toBeGreaterThan(0);
      posts.forEach((post: Post) => {
        expect(post.userId).toBe(userId);
      });
    });

    test('@api should get posts with pagination', async () => {
      const response = await apiHelper.get('/posts?_page=1&_limit=10');
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseArrayLength(response, 10);
    });
  });

  test.describe('GET /posts/{id}', () => {
    test('@api @smoke should get post by id', async () => {
      const postId = 1;
      const response = await apiHelper.get(`/posts/${postId}`);
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseFieldValue(response, 'id', postId);
      await apiHelper.expectResponseHasField(response, 'title');
      await apiHelper.expectResponseHasField(response, 'body');
      await apiHelper.expectResponseHasField(response, 'userId');
    });

    test('@api should return 404 for non-existent post', async () => {
      const response = await apiHelper.get('/posts/999');
      
      await apiHelper.expectStatus(response, 404);
    });
  });

  test.describe('POST /posts', () => {
    test('@api @smoke should create a new post', async () => {
      const newPost = testPosts[0];
      const response = await apiHelper.post('/posts', newPost);
      
      await apiHelper.expectStatus(response, 201);
      await apiHelper.expectResponseContains(response, {
        title: newPost.title,
        body: newPost.body,
        userId: newPost.userId
      });
      await apiHelper.expectResponseHasField(response, 'id');
    });

    test('@api should create post with minimal data', async () => {
      const minimalPost = {
        title: 'Minimal Post',
        body: 'This is a minimal post',
        userId: 1
      };
      
      const response = await apiHelper.post('/posts', minimalPost);
      
      await apiHelper.expectStatus(response, 201);
      await apiHelper.expectResponseContains(response, minimalPost);
    });
  });

  test.describe('PUT /posts/{id}', () => {
    test('@api @smoke should update post completely', async () => {
      const postId = 1;
      const updatedPost = {
        title: 'Updated Post Title',
        body: 'This is the updated post body',
        userId: 1
      };
      
      const response = await apiHelper.put(`/posts/${postId}`, updatedPost);
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseContains(response, updatedPost);
      await apiHelper.expectResponseFieldValue(response, 'id', postId);
    });
  });

  test.describe('PATCH /posts/{id}', () => {
    test('@api should partially update post', async () => {
      const postId = 1;
      const partialUpdate = {
        title: 'Partially Updated Post'
      };
      
      const response = await apiHelper.patch(`/posts/${postId}`, partialUpdate);
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseContains(response, partialUpdate);
      await apiHelper.expectResponseFieldValue(response, 'id', postId);
    });
  });

  test.describe('DELETE /posts/{id}', () => {
    test('@api @smoke should delete post', async () => {
      const response = await apiHelper.delete('/posts/1');
      
      await apiHelper.expectStatus(response, 200);
    });
  });

  test.describe('GET /posts/{id}/comments', () => {
    test('@api should get comments for a specific post', async () => {
      const postId = 1;
      const response = await apiHelper.get(`/posts/${postId}/comments`);
      
      await apiHelper.expectStatus(response, 200);
      
      const comments = await response.json();
      expect(Array.isArray(comments)).toBe(true);
      
      if (comments.length > 0) {
        expect(comments[0]).toHaveProperty('id');
        expect(comments[0]).toHaveProperty('postId');
        expect(comments[0]).toHaveProperty('name');
        expect(comments[0]).toHaveProperty('email');
        expect(comments[0]).toHaveProperty('body');
      }
    });

    test('@api should return empty array for post with no comments', async () => {
      const response = await apiHelper.get('/posts/999/comments');
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseArrayLength(response, 0);
    });
  });
}); 