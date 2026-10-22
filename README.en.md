# dsh-ideas: turn memory and goals into your next action

[中文](README.md) | **English**

Ideas is a DeepSeek Harness plugin that turns personal memory, unfinished goal steps, and recent conversations into suggestions you can act on in chat.

## Features

- Recommendations grounded in Meow memory and unfinished Goals steps, with visible supporting context.
- A detail page before starting a task, followed by execution in a DSH conversation.
- Progress tracking that distinguishes running, waiting for input or approval, external dependencies, review, and scheduled follow-up.
- Completion feedback to the exact linked Goals step after verification or explicit user confirmation.
- Cards with a 420px minimum height, equal heights within each row, and aligned bottom actions. Expanded content remains readable.
- General-purpose ideas that do not require existing personal memory.

![Ideas cards with sample data](docs/images/ideas-cards.png)

The screenshot is a development preview using sample data.

## Install

Requires **DSH 0.2.1-alpha.1 or 0.2.1-alpha.2 Web**, a working default model, and Node.js `^22.19.0` or `>=24.0.0`.

In DSH, open **Plugins → Add plugin** and paste:

```text
https://github.com/dawn0713/dsh-ideas/releases/latest/download/dsh-ideas.tgz
```

Enable the plugin, restart `dsh web`, and refresh the page. The same tgz supports both DSH versions.

CLI installation is also supported:

```sh
dsh plugin --profile web add "https://github.com/dawn0713/dsh-ideas/releases/latest/download/dsh-ideas.tgz"
```

You can also pass the path to a downloaded tgz. No unpacking or compilation is required. Source-based DSH installations can use `pnpm dsh` from the host repository.

## Optional integrations

**Meow** supplies personal memory. If memory is unavailable, Ideas shows a notice and can still use an available Goals source or general-purpose ideas.

**Goals** supplies persistent goals and steps. Completion feedback requires a Goals plugin exposing the `personalGoals` service with `get` and `updateTask`; integration has been verified against the Goals 0.2.0 functionality. Meow, Goals, and the DSH host are not bundled in this repository.

## Goals feedback

Ideas stores the actual goal and task identifiers when generating a linked recommendation. Verified or explicitly confirmed completion marks that step as done through the Goals service.

Feedback is persisted before delivery. Failures remain visible and can be retried without executing the task again. Completed steps are not rewritten, and missing or cancelled steps produce an error. Unlinked ideas and historical completions from older versions are not automatically written back. Completing one step does not complete the entire goal.

## Data and models

Ideas are stored as Markdown files under `~/.dsh/ideas/`. Recommendation state is stored in `_engine.md` in the same directory. Updating the plugin preserves these files.

The plugin uses the model configured in DSH. During recommendation generation, relevant memory, goal information, and recent conversation context are sent to that model service. Scheduled follow-up uses DSH scheduling and requires DSH to remain running.

## Development

Prebuilt `dist/` files are included. Release installation does not require a build.

```sh
npm install
npm run build
npm test
npm run preview
```

The local preview at `http://127.0.0.1:3461` uses sample data and does not call a real model or send work to real conversations.

See [verification](docs/VERIFICATION.md) and [release instructions](docs/RELEASING.md) for details.

## License

[MIT](LICENSE)
