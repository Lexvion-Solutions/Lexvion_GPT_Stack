# Initialize Repository

To prepare this repository for development:

1. Initialize a git repo and make the first commit:
   ```sh
   git init
   git add .
   git commit -m "Initial commit: merged Lexvion stack"
   ```

2. Add the remote origin and push (replace URL with your repository):
   ```sh
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

3. Configure CI/CD secrets as needed for deployments.
