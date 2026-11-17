# Contributing to ToolBazaar

Thanks for helping improve ToolBazaar. Contributions should preserve its core principles: files stay in the user's browser, each tool has isolated state, and the interface remains usable across devices.

## Getting started

1. Fork the repository and create a topic branch.
2. Serve the project over HTTP, for example with `python -m http.server 8000`.
3. Open `http://localhost:8000/` and test the relevant tool in a browser.
4. Keep changes focused and avoid adding build dependencies unless needed.

## Pull requests

- Describe the behavior changed and how you tested it.
- Test the affected tool at desktop and mobile widths.
- For file tools, verify a file selected in one workspace is not shared with another.
- Avoid uploading user files or adding credentials, API keys, or personal data.
- If adding a CDN dependency, pin its version and update the service-worker precache list.
- Keep keyboard access, labels, error feedback, and offline behavior in mind.

## Reporting issues

Include browser/OS details, steps to reproduce, expected behavior, and relevant console errors. Do not attach confidential files; use a small synthetic sample when possible.

## License

By submitting a contribution, you agree it is distributed under the project's [MIT License](LICENSE).
