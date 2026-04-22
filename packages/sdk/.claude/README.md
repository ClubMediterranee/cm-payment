# Club Med Payment SDK - Claude Code Integration

This directory contains Claude Code skills to help developers integrate the `@clubmed/caps` payment SDK into their applications.

## Available Skills

### `integrate-caps-sdk`

An intelligent skill that automates the integration of the Club Med payment SDK into any React application.

**Location**: `skills/integrate-caps-sdk.md`

**What it does**:

- Scans your codebase to detect framework, routing, and configuration
- Generates payment and confirmation pages with pre-configured components
- Configures PaymentConfigProvider with detected parameters
- Updates router with new payment routes
- Validates setup and provides checklist

**How to use**:

1. Install the SDK in your project:

   ```bash
   npm install @clubmed/caps @tanstack/react-query react-hook-form @clubmed/trident-ui @clubmed/trident-icons
   ```

2. Open your project in Claude Code

3. Invoke the skill by asking:

   ```
   "Help me integrate the Club Med payment SDK"
   ```

   Or use the skill directly:

   ```
   /integrate-caps-sdk
   ```

4. Answer the questions about your integration needs

5. Review the generated code and follow the checklist

## For Developers of This SDK

This directory is published as part of the npm package to provide integration assistance to SDK consumers.

### Adding New Skills

To add a new skill:

1. Create a new `.md` file in the `skills/` directory
2. Follow the Claude Code skill format (see existing skills for examples)
3. Update this README to document the new skill
4. Update the main README.md to mention the new skill

### Testing Skills

To test skills during development:

1. Build the SDK: `pnpm build`
2. Link it locally: `pnpm link --global` (in this directory)
3. In a test project: `pnpm link --global @clubmed/caps`
4. The skills will be available in `node_modules/@clubmed/caps/.claude/skills/`

## Support

For issues or questions:

- SDK Documentation: See main README.md
- GitHub Issues: [Create an issue](https://github.com/clubmed/payment-sdk/issues)
- Internal Support: Contact the Payment Team

## License

BSD-3-Clause - Copyright (c) Club Med
