# Angular Playground 19

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.0.2. This project is an Angular application that interfaces with the Ollama API to provide a chat experience. Users can send messages and receive streamed responses in real-time.

## Project Structure

```
ollama-chat
├── src
│   ├── app
│   │   ├── components
│   │   │   ├── chat
│   │   │   │   ├── chat.component.ts
│   │   │   │   ├── chat.component.html
│   │   │   │   ├── chat.component.scss
│   │   │   │   └── chat.component.spec.ts
│   │   │   ├── message
│   │   │   │   ├── message.component.ts
│   │   │   │   ├── message.component.html
│   │   │   │   ├── message.component.scss
│   │   │   │   └── message.component.spec.ts
│   │   │   └── model-selector
│   │   │       ├── model-selector.component.ts
│   │   │       ├── model-selector.component.html
│   │   │       ├── model-selector.component.scss
│   │   │       └── model-selector.component.spec.ts
│   │   ├── services
│   │   │   └── ollama.service.ts
│   │   ├── models
│   │   │   ├── chat-message.model.ts
│   │   │   └── ollama-model.model.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── assets
│   │   └── icons
│   ├── environments
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
└── README.md
```

## Features

- **Chat Interface**: Users can send messages and receive responses in real-time.
- **Model Selection**: Users can choose from available models for the chat.
- **Streaming Responses**: The application supports streaming responses from the Ollama API.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/actionanand/ollama-chat.git
   ```
2. Navigate to the project directory:
   ```
   cd ollama-chat
   ```
3. Install the dependencies:
   ```
   yarn install
   ```

## Running the Application

To run the application in development mode, use the following command:

```
yarn develop
```

Open your browser and navigate to `http://localhost:4212` to access the application.

## Cloning Guide

1.  Clone only the remote primary HEAD (default: origin/main)

```bash
git clone <url> --single-branch
```

2. Only specific branch

```bash
git clone <url> --branch <branch> --single-branch [<folder>]
```

```bash
git clone <url> --branch <branch>
```

3. Cloning repositories using degit

   - main branch is default.

```bash
npx degit github:user/repo#branch-name <folder-name>
```

4. Cloning this project with skeleton

```bash
git clone https://github.com/actionanand/ollama-chat.git --branch 1-skeleton angular-proj-name
```

```bash
npx degit github:actionanand/ollama-chat#1-skeleton angular-proj-name
```

## Automate using `Prettier`, `Es Lint` and `Husky`

1. Install the compatible node version

```bash
  nvm install v22.11.0
```

2. Install and Configure Prettier

   - Install prettier as below:

   ```bash
     yarn add prettier -D
   ```

   - Create a `.prettierrc.yml` file and write down the format as below: - [online ref](https://prettier.io/docs/en/options.html)

   ```yml
   trailingComma: 'all'
   tabWidth: 2
   useTabs: false
   semi: true
   singleQuote: true
   bracketSpacing: true
   bracketSameLine: true
   arrowParens: 'avoid'
   printWidth: 120
   overrides:
     - files:
         - '*.js'
         - '*.jsx'
       options:
         bracketSpacing: true
         jsxSingleQuote: true
         semi: true
         singleQuote: true
         tabWidth: 2
         useTabs: false
     - files:
         - '*.ts'
       options:
         tabWidth: 2
   ```

   - Create a `.prettierignore` file and write as below(sample)

   ```gitignore
   # Ignore artifacts:
   build
   coverage
   e2e
   node_modules
   dist
   dest
   reports

   # Ignore files
   *.lock
   package-lock.json
   yarn.lock
   ```

3. Install `Es Lint`, if not installed

```bash
ng add @angular-eslint/schematics
```

if error comes, use the below command

```shell
ng add @angular-eslint/schematics@19.0.0-alpha.4
# or
ng add @angular-eslint/schematics@next
```

4. Configure pre-commit hooks

Pre-commit hooks are a nice way to run certain checks to ensure clean code. This can be used to format staged files if for some reason they weren’t automatically formatted during editing. [husky](https://github.com/typicode/husky) can be used to easily configure git hooks to prevent bad commits. We will use this along with [pretty-quick](https://github.com/azz/pretty-quick) to run Prettier on our changed files. Install these packages, along with [npm-run-all](https://github.com/mysticatea/npm-run-all), which will make it easier for us to run npm scripts:

```bash
yarn add husky pretty-quick npm-run-all -D
```

To configure the pre-commit hook, simply add a `precommit` npm script. We want to first run Prettier, then run TSLint on the formatted files. To make our scripts cleaner, I am using the npm-run-all package, which gives you two commands, `run-s` to run scripts in sequence, and `run-p` to run scripts in parallel:

```json
  "precommit": "run-s format:fix lint",
  "format:fix": "pretty-quick --staged",
  "format:check": "prettier --config ./.prettierrc --list-different \"src/{app,environments,assets}/**/*{.ts,.js,.json,.css,.scss}\"",
  "format:all": "prettier --config ./.prettierrc --write \"src/{app,environments,assets}/**/*{.ts,.js,.json,.css,.scss}\"",
  "lint": "ng lint",
```

5. Initialize husky

   - Run it once

   ```bash
     npx husky init
   ```

   - Add a hook

   ```bash
     echo "yarn run precommit" > .husky/pre-commit
     echo "yarn run test" > .husky/pre-commit
   ```

   - Make a commit

   ```bash
     git commit -m "Keep calm and commit"
     # `yarn run precommit and yarn test` will run every time you commit
   ```

6. How to skip prettier format only in particular file

   1. JS

   ```js
   matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);

   // prettier-ignore
   matrix(
       1, 0, 0,
       0, 1, 0,
       0, 0, 1
     )
   ```

   2. JSX

   ```jsx
   <div>
     {/* prettier-ignore */}
     <span     ugly  format=''   />
   </div>
   ```

   3. HTML

   ```html
   <!-- prettier-ignore -->
   <div         class="x"       >hello world</div            >

   <!-- prettier-ignore-attribute -->
   <div (mousedown)="       onStart    (    )         " (mouseup)="         onEnd      (    )         "></div>

   <!-- prettier-ignore-attribute (mouseup) -->
   <div (mousedown)="onStart()" (mouseup)="         onEnd      (    )         "></div>
   ```

   4. CSS

   ```css
   /* prettier-ignore */
   .my    ugly rule
     {
   
     }
   ```

   5. Markdown

   ```md
     <!-- prettier-ignore -->

   Do not format this
   ```

   6. YAML

   ```yml
   # prettier-ignore
   key  : value
     hello: world
   ```

   7. For more, please [check](https://prettier.io/docs/en/ignore.html)

## Resources

- [GitHub Actions for Angular](https://github.com/rodrigokamada/angular-github-actions)
- [Angular 16 - milestone release](https://github.com/actionanand/ng16-signal-milestone-release)
- [Meet Angular v19 - Official](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [Angular 19 – what’s new?](https://angular.love/angular-19-whats-new)
- [Angular Version 19: New Features and Updates](https://dev.to/this-is-angular/angular-version-19-new-features-and-updates-3nk7)
- [Angular 19 - 5 Game-Changing Features You Need to Know](https://dev.to/this-is-angular/angular-19-5-game-changing-features-you-need-to-know-32cd)
- [Changing the visibility of your GitHub Pages site](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)
- [The `package.json` guide](https://flaviocopes.com/package-json/#author)
- [GenAI — Build LLM Streaming in Angular UI with FastAPI Backend](https://verticalserve.medium.com/genai-build-llm-streaming-in-angular-ui-with-fastapi-backend-68b9fde2dd91)
