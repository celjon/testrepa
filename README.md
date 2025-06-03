# Bothub Backend

## Stack
- **Bun** (package manager & runtime)
- **Node.js** (v22.14.0)
- **Express.js** (v4.18.2)
- **TypeScript** (v4.9.5)
- **Prisma**
- **Docker**
- **PostgreSQL**

## Installation

### Prerequisites
1. Install [Bun](https://bun.sh/) (required for package management).
2. Install [Docker](https://www.docker.com/) if using PostgreSQL via Docker.

### Setup

1. Clone the repository:
   ```sh
   git clone <repository_url>
   cd bothub-backend
   ```  

2. Install dependencies:
   ```sh
   bun install
   ```  

3. Copy the example configuration files:
   ```sh
   cp config.example.yml config.yml
   cp .env.example .env
   ```  

4. Apply database migrations:
   ```sh
   bun migrate:dev
   ```  

5. Seed the database:
   ```sh
   bun seed:dev
   ```  

6. Start the application:
   ```sh
   make
   ```  

## Configuration

- **Environment Variables**: Stored in `.env`, required for Prisma and database connection.
- **Application Config**: Located in `config.yml`, can be customized for different environments.

## Development

- To run the project locally, follow the installation steps above.
- Ensure all changes follow the existing code style.
- Use **Bun** for package management (`bun add`, `bun remove`, etc.).

## Predeploy Scripts

The predeploy scripts are located in `ci_scripts/` and are executed just before deployment, after all dependencies are up.  
These scripts are controlled by the `PREDEPLOY_SCRIPT` CI/CD environment variable, which contains only the **NAME** of the script file without the extension.  
The scripts are available in the pipeline only if `$PREDEPLOY_SCRIPT` is set, so regular Git pushes won't trigger them.

**Naming convention**: `<version>_<basic_description>.ts`

For example, a predeploy script could look like this:  
`1_0_0_migrate.ts`
![Example](https://i.imgur.com/epVYK6Q.png)

## Code Style

- Enable case-sensitivity in Git:
  ```sh
  git config core.ignorecase false
  git config --global core.ignorecase false
  ```  
- Use **kebab-case** for filenames to prevent issues on case-insensitive file systems.  
