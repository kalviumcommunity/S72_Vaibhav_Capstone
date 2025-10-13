AWS S3 Avatar Upload (optional)
================================

This project supports optional avatar uploads to AWS S3. By default the server saves uploaded avatars to the local `./uploads/avatars` folder. To enable S3 uploads, set the following environment variables in your `.env` file or environment:

- AWS_S3_BUCKET - The name of your S3 bucket (e.g. `my-app-avatars`)
- AWS_REGION - The AWS region for the bucket (e.g. `us-east-1`)
- AWS_ACCESS_KEY_ID - (optional) If running locally, set your AWS credentials
- AWS_SECRET_ACCESS_KEY - (optional) Your AWS secret key

Behavior:
- When `AWS_S3_BUCKET` and `AWS_REGION` are present the server will configure multer to use memory storage and the controller will upload files to S3 and save a public URL on the user document.
- If S3 is not configured, the server falls back to local disk storage under `./uploads/avatars` and continues to serve static files from `/uploads`.

Notes:
- Ensure your S3 bucket policy allows public read for uploaded objects (or adapt the code to generate signed URLs if you prefer private objects).
- For production deployments, use IAM roles (EC2/ECS/Lambda) instead of long-lived access keys where possible.
