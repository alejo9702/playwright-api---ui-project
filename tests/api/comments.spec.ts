import { test, expect } from '@playwright/test';
import { ApiHelper } from '../utils/api-helper';
import { testComments, Comment } from '../fixtures/test-data';

test.describe('Comments API Tests', () => {
  let apiHelper: ApiHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  test.describe('GET /comments', () => {
    test('@api @smoke should get all comments', async () => {
      const response = await apiHelper.get('/comments');
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseArrayLength(response, 500);
      
      const comments = await response.json();
      expect(comments[0]).toHaveProperty('id');
      expect(comments[0]).toHaveProperty('postId');
      expect(comments[0]).toHaveProperty('name');
      expect(comments[0]).toHaveProperty('email');
      expect(comments[0]).toHaveProperty('body');
    });

    test('@api should get comments by post id', async () => {
      const postId = 1;
      const response = await apiHelper.get(`/comments?postId=${postId}`);
      
      await apiHelper.expectStatus(response, 200);
      
      const comments = await response.json();
      expect(comments.length).toBeGreaterThan(0);
      comments.forEach((comment: Comment) => {
        expect(comment.postId).toBe(postId);
      });
    });

    test('@api should get comments with pagination', async () => {
      const response = await apiHelper.get('/comments?_page=1&_limit=5');
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseArrayLength(response, 5);
    });
  });

  test.describe('GET /comments/{id}', () => {
    test('@api @smoke should get comment by id', async () => {
      const commentId = 1;
      const response = await apiHelper.get(`/comments/${commentId}`);
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseFieldValue(response, 'id', commentId);
      await apiHelper.expectResponseHasField(response, 'postId');
      await apiHelper.expectResponseHasField(response, 'name');
      await apiHelper.expectResponseHasField(response, 'email');
      await apiHelper.expectResponseHasField(response, 'body');
    });

    test('@api should return 404 for non-existent comment', async () => {
      const response = await apiHelper.get('/comments/999');
      
      await apiHelper.expectStatus(response, 404);
    });
  });

  test.describe('POST /comments', () => {
    test('@api @smoke should create a new comment', async () => {
      const newComment = testComments[0];
      const response = await apiHelper.post('/comments', newComment);
      
      await apiHelper.expectStatus(response, 201);
      await apiHelper.expectResponseContains(response, {
        postId: newComment.postId,
        name: newComment.name,
        email: newComment.email,
        body: newComment.body
      });
      await apiHelper.expectResponseHasField(response, 'id');
    });

    test('@api should create comment with minimal data', async () => {
      const minimalComment = {
        postId: 1,
        name: 'Minimal Commenter',
        email: 'minimal@example.com',
        body: 'This is a minimal comment'
      };
      
      const response = await apiHelper.post('/comments', minimalComment);
      
      await apiHelper.expectStatus(response, 201);
      await apiHelper.expectResponseContains(response, minimalComment);
    });
  });

  test.describe('PUT /comments/{id}', () => {
    test('@api @smoke should update comment completely', async () => {
      const commentId = 1;
      const updatedComment = {
        postId: 1,
        name: 'Updated Commenter',
        email: 'updated@example.com',
        body: 'This is an updated comment'
      };
      
      const response = await apiHelper.put(`/comments/${commentId}`, updatedComment);
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseContains(response, updatedComment);
      await apiHelper.expectResponseFieldValue(response, 'id', commentId);
    });
  });

  test.describe('PATCH /comments/{id}', () => {
    test('@api should partially update comment', async () => {
      const commentId = 1;
      const partialUpdate = {
        name: 'Partially Updated Commenter',
        body: 'This is a partially updated comment'
      };
      
      const response = await apiHelper.patch(`/comments/${commentId}`, partialUpdate);
      
      await apiHelper.expectStatus(response, 200);
      await apiHelper.expectResponseContains(response, partialUpdate);
      await apiHelper.expectResponseFieldValue(response, 'id', commentId);
    });
  });

  test.describe('DELETE /comments/{id}', () => {
    test('@api @smoke should delete comment', async () => {
      const response = await apiHelper.delete('/comments/1');
      
      await apiHelper.expectStatus(response, 200);
    });
  });

  test.describe('Email Validation', () => {
    test('@api should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      for (const email of validEmails) {
        const comment = {
          postId: 1,
          name: 'Email Test',
          email: email,
          body: 'Testing email validation'
        };
        
        const response = await apiHelper.post('/comments', comment);
        await apiHelper.expectStatus(response, 201);
      }
    });

    test('@api should handle invalid email formats gracefully', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ];

      for (const email of invalidEmails) {
        const comment = {
          postId: 1,
          name: 'Invalid Email Test',
          email: email,
          body: 'Testing invalid email handling'
        };
        
        const response = await apiHelper.post('/comments', comment);
        // Note: JSONPlaceholder doesn't validate emails, so this will likely return 201
        // In a real API, this would typically return 400
        expect([200, 201, 400]).toContain(response.status());
      }
    });
  });

  test.describe('Data Validation', () => {
    test('@api should handle empty comment body', async () => {
      const comment = {
        postId: 1,
        name: 'Empty Body Test',
        email: 'empty@example.com',
        body: ''
      };
      
      const response = await apiHelper.post('/comments', comment);
      // Note: JSONPlaceholder doesn't validate empty fields
      expect([200, 201, 400]).toContain(response.status());
    });

    test('@api should handle very long comment body', async () => {
      const longBody = 'A'.repeat(1000); // 1000 character comment
      const comment = {
        postId: 1,
        name: 'Long Body Test',
        email: 'long@example.com',
        body: longBody
      };
      
      const response = await apiHelper.post('/comments', comment);
      expect([200, 201, 400, 413]).toContain(response.status());
    });
  });
}); 